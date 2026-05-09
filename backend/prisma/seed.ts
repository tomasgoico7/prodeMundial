/**
 * Seed del Mundial 2026.
 *
 * Por defecto importa el FIXTURE OFICIAL real (equipos, grupos, fechas,
 * horarios y sedes) desde openfootball (dominio público, gratis, sin API key).
 * Si no hay conexión, cae al dataset interno generado. Es idempotente.
 */
import { PrismaClient, StageType, MatchStatus } from '@prisma/client';
import {
  TOURNAMENT,
  GROUPS,
  STAGES,
  GROUP_ROUND_ROBIN,
  KNOCKOUT_MATCHES,
  VENUES,
  OPENFOOTBALL_2026_URL,
  EN_TO_TEAM,
  GROUND_TO_VENUE,
  roundToStage,
  parseKickoff,
  knockoutLabel,
  type OpenFootballFile,
} from './data/worldcup-2026';

const prisma = new PrismaClient();

function addDays(base: Date, days: number, hour = 18): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
}

async function ensureTournamentAndStages() {
  const tournament = await prisma.tournament.upsert({
    where: { externalId: TOURNAMENT.externalId },
    update: {},
    create: {
      name: TOURNAMENT.name,
      season: TOURNAMENT.season,
      externalId: TOURNAMENT.externalId,
      startDate: new Date(TOURNAMENT.startDate),
      endDate: new Date(TOURNAMENT.endDate),
    },
  });
  for (const s of STAGES) {
    await prisma.stage.upsert({
      where: { type: s.type as StageType },
      update: { name: s.name, order: s.order },
      create: { type: s.type as StageType, name: s.name, order: s.order },
    });
  }
  return tournament;
}

// ─── Import oficial (openfootball) ───────────────────────────
async function seedFromOpenFootball(): Promise<boolean> {
  let data: OpenFootballFile;
  try {
    const res = await fetch(OPENFOOTBALL_2026_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = (await res.json()) as OpenFootballFile;
  } catch (err) {
    console.warn(
      `⚠️  No se pudo bajar el fixture oficial (${(err as Error).message}). Uso dataset interno.`,
    );
    return false;
  }
  if (!data?.matches?.length) return false;

  console.log(`🌐 Importando fixture OFICIAL desde openfootball (${data.matches.length} partidos)...`);

  const tournament = await ensureTournamentAndStages();
  const stages = await prisma.stage.findMany();
  const stageMap = new Map(stages.map((s) => [s.type, s.id]));
  const groupLetter = (g?: string) => (g ? g.replace(/group/i, '').trim() : null);

  // 1) Grupos y equipos a partir de los partidos de fase de grupos
  const groupTeams = new Map<string, Set<string>>();
  for (const m of data.matches) {
    if (roundToStage(m.round) !== 'GROUP') continue;
    const letter = groupLetter(m.group);
    if (!letter) continue;
    for (const t of [m.team1, m.team2]) {
      if (!EN_TO_TEAM[t]) continue;
      if (!groupTeams.has(letter)) groupTeams.set(letter, new Set());
      groupTeams.get(letter)!.add(t);
    }
  }

  const teamIdByEn = new Map<string, string>();
  const groupIdByLetter = new Map<string, string>();
  for (const [letter, names] of [...groupTeams.entries()].sort()) {
    const tg = await prisma.teamGroup.upsert({
      where: { tournamentId_name: { tournamentId: tournament.id, name: letter } },
      update: {},
      create: { name: letter, tournamentId: tournament.id },
    });
    groupIdByLetter.set(letter, tg.id);
    for (const en of names) {
      const t = EN_TO_TEAM[en];
      const team = await prisma.team.upsert({
        where: { tournamentId_code: { tournamentId: tournament.id, code: t.code } },
        update: { name: t.name, flag: t.flag, teamGroupId: tg.id },
        create: {
          name: t.name,
          code: t.code,
          flag: t.flag,
          tournamentId: tournament.id,
          teamGroupId: tg.id,
        },
      });
      teamIdByEn.set(en, team.id);
    }
  }

  // 2) Fecha del grupo (1/2/3): ordeno los partidos de cada grupo por kickoff
  const perGroup = new Map<string, { idx: number; ko: number }[]>();
  data.matches.forEach((m, i) => {
    if (roundToStage(m.round) !== 'GROUP') return;
    const letter = groupLetter(m.group);
    if (!letter) return;
    const arr = perGroup.get(letter) ?? [];
    arr.push({ idx: i, ko: parseKickoff(m.date, m.time).getTime() });
    perGroup.set(letter, arr);
  });
  const matchdayByIdx = new Map<number, number>();
  for (const arr of perGroup.values()) {
    arr.sort((a, b) => a.ko - b.ko);
    arr.forEach((e, pos) => matchdayByIdx.set(e.idx, Math.floor(pos / 2) + 1));
  }

  // 3) Partidos — numeración oficial: grupos 1-72, eliminatorias 73-104
  let grpNum = 0;
  let koNum = 72;
  for (let i = 0; i < data.matches.length; i++) {
    const m = data.matches[i];
    const stageType = roundToStage(m.round) as StageType;
    const externalId = `of2026-${i}`;
    const kickoff = parseKickoff(m.date, m.time);
    const venue = m.ground ? GROUND_TO_VENUE[m.ground] : undefined;
    const finished =
      typeof m.score1 === 'number' && typeof m.score2 === 'number';
    const base = {
      status: (finished ? 'FINISHED' : 'SCHEDULED') as MatchStatus,
      homeScore: finished ? m.score1! : null,
      awayScore: finished ? m.score2! : null,
      kickoff,
      venue: venue?.stadium ?? m.ground ?? null,
      city: venue?.city ?? m.ground ?? null,
    };
    // IMPORTANTE: el seed corre en CADA arranque. Al actualizar un partido que ya
    // existe NO debemos pisar el resultado en vivo (status/homeScore/awayScore),
    // sino solo refrescar metadata estática (horario/estadio). Los resultados los
    // dueña la carga manual o el job de sincronización, no el seed.
    const meta = { kickoff, venue: base.venue, city: base.city };

    const isGroup =
      stageType === StageType.GROUP && !!EN_TO_TEAM[m.team1] && !!EN_TO_TEAM[m.team2];
    const matchNumber = stageType === StageType.GROUP ? ++grpNum : ++koNum;

    if (isGroup) {
      const letter = groupLetter(m.group);
      const matchday = matchdayByIdx.get(i) ?? null;
      await prisma.match.upsert({
        where: { externalId },
        update: { ...meta, matchday, matchNumber },
        create: {
          externalId,
          tournamentId: tournament.id,
          stageId: stageMap.get(stageType)!,
          teamGroupId: letter ? groupIdByLetter.get(letter) : undefined,
          homeTeamId: teamIdByEn.get(m.team1),
          awayTeamId: teamIdByEn.get(m.team2),
          matchday,
          matchNumber,
          ...base,
        },
      });
    } else {
      // Eliminatorias: guardo el código de slot oficial (m.team1/m.team2) y una
      // etiqueta amigable. Los equipos se resuelven luego según las posiciones.
      await prisma.match.upsert({
        where: { externalId },
        update: {
          ...meta,
          matchNumber,
          homeSlot: m.team1,
          awaySlot: m.team2,
          homeLabel: knockoutLabel(m.team1),
          awayLabel: knockoutLabel(m.team2),
        },
        create: {
          externalId,
          tournamentId: tournament.id,
          stageId: stageMap.get(stageType)!,
          matchNumber,
          homeSlot: m.team1,
          awaySlot: m.team2,
          homeLabel: knockoutLabel(m.team1),
          awayLabel: knockoutLabel(m.team2),
          ...base,
        },
      });
    }
  }

  const teamCount = await prisma.team.count();
  const matchCount = await prisma.match.count();
  console.log(
    `✅ Fixture OFICIAL importado — ${teamCount} equipos, ${matchCount} partidos.`,
  );
  return true;
}

// ─── Fallback offline (dataset interno generado) ─────────────
async function seedFromStatic() {
  console.log('🌱 Seeding (dataset interno) World Cup 2026...');
  const tournament = await ensureTournamentAndStages();
  const startDate = new Date(TOURNAMENT.startDate);
  const groupStage = await prisma.stage.findUniqueOrThrow({ where: { type: 'GROUP' } });

  for (let gi = 0; gi < GROUPS.length; gi++) {
    const g = GROUPS[gi];
    const teamGroup = await prisma.teamGroup.upsert({
      where: { tournamentId_name: { tournamentId: tournament.id, name: g.name } },
      update: {},
      create: { name: g.name, tournamentId: tournament.id },
    });

    const teamIds: string[] = [];
    for (const t of g.teams) {
      const team = await prisma.team.upsert({
        where: { tournamentId_code: { tournamentId: tournament.id, code: t.code } },
        update: { name: t.name, flag: t.flag, teamGroupId: teamGroup.id },
        create: {
          name: t.name,
          code: t.code,
          flag: t.flag,
          tournamentId: tournament.id,
          teamGroupId: teamGroup.id,
        },
      });
      teamIds.push(team.id);
    }

    for (const round of GROUP_ROUND_ROBIN) {
      for (let p = 0; p < round.pairs.length; p++) {
        const [h, a] = round.pairs[p];
        const externalId = `wc2026-G${g.name}-MD${round.matchday}-${p}`;
        const dayOffset = (round.matchday - 1) * 5 + Math.floor(gi / 3);
        const kickoff = addDays(startDate, dayOffset, 16 + p * 3);
        const venue = VENUES[(gi * 6 + (round.matchday - 1) * 2 + p) % VENUES.length];
        await prisma.match.upsert({
          where: { externalId },
          update: { venue: venue.stadium, city: venue.city },
          create: {
            externalId,
            tournamentId: tournament.id,
            stageId: groupStage.id,
            teamGroupId: teamGroup.id,
            homeTeamId: teamIds[h],
            awayTeamId: teamIds[a],
            kickoff,
            matchday: round.matchday,
            status: 'SCHEDULED',
            venue: venue.stadium,
            city: venue.city,
          },
        });
      }
    }
  }

  const stagesByType = await prisma.stage.findMany();
  const stageMap = new Map(stagesByType.map((s) => [s.type, s.id]));
  let koIndex = 0;
  for (const ko of KNOCKOUT_MATCHES) {
    const externalId = `wc2026-KO-${ko.stage}-${koIndex}`;
    const venue = VENUES[koIndex % VENUES.length];
    koIndex++;
    await prisma.match.upsert({
      where: { externalId },
      update: { venue: venue.stadium, city: venue.city },
      create: {
        externalId,
        tournamentId: tournament.id,
        stageId: stageMap.get(ko.stage as StageType)!,
        homeLabel: ko.homeLabel,
        awayLabel: ko.awayLabel,
        kickoff: addDays(startDate, ko.daysFromStart, 19),
        status: 'SCHEDULED',
        venue: venue.stadium,
        city: venue.city,
      },
    });
  }

  const teamCount = await prisma.team.count();
  const matchCount = await prisma.match.count();
  console.log(`✅ Seed interno completo — ${teamCount} equipos, ${matchCount} partidos.`);
}

async function main() {
  const imported = await seedFromOpenFootball();
  if (!imported) {
    await seedFromStatic();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
