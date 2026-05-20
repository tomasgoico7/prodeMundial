import { Injectable, Logger } from '@nestjs/common';
import { StageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PHASES, buildStageInfo, computePhaseStatuses } from '../predictions/phases';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  private async stageInfo() {
    const matches = await this.prisma.match.findMany({
      select: { status: true, kickoff: true, stage: { select: { type: true } } },
    });
    return buildStageInfo(matches);
  }

  /**
   * Detecta fases que se acaban de habilitar y envía un email (una sola vez por
   * fase) a los usuarios que todavía no la firmaron. Se llama tras cada
   * actualización de resultados.
   */
  async announceNewlyOpenPhases(): Promise<void> {
    const tournament = await this.prisma.tournament.findFirst({ orderBy: { season: 'desc' } });
    if (!tournament) return;

    const phases = computePhaseStatuses(await this.stageInfo(), []);
    const openKeys = phases.filter((p) => p.status === 'open').map((p) => p.key as StageType);
    // GROUP se cubre con el mail de bienvenida al registrarse; acá sólo eliminatorias.
    const toAnnounce = openKeys.filter(
      (k) => k !== StageType.GROUP && !tournament.notifiedPhases.includes(k),
    );
    if (!toAnnounce.length) return;

    // Marcar como anunciadas ANTES de enviar, para que llamadas concurrentes
    // (fire-and-forget) no manden el aviso dos veces.
    await this.prisma.tournament.update({
      where: { id: tournament.id },
      data: { notifiedPhases: { set: [...new Set([...tournament.notifiedPhases, ...toAnnounce])] } },
    });

    const users = await this.prisma.user.findMany({ include: { prediction: true } });
    for (const key of toAnnounce) {
      const label = PHASES.find((p) => p.key === key)!.label;
      const recipients = users.filter((u) => !(u.prediction?.lockedPhases ?? []).includes(key));
      for (const u of recipients) {
        await this.mail.sendPhaseAvailable(u.email, u.firstName, label);
      }
      this.logger.log(`Fase "${label}" anunciada por email a ${recipients.length} usuario(s).`);
    }
  }

  /** Al registrarse, si la fase de grupos está abierta, avisa por email. */
  async welcomeGroupPhase(email: string, firstName: string): Promise<void> {
    const group = computePhaseStatuses(await this.stageInfo(), []).find((p) => p.key === 'GROUP');
    if (group?.status === 'open') {
      await this.mail.sendPhaseAvailable(email, firstName, 'Fase de grupos');
    }
  }
}
