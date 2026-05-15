import {
  Body,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StageType } from '@prisma/client';
import { MatchesService } from './matches.service';
import { SetResultDto } from './dto/set-result.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class MatchesController {
  constructor(
    private readonly matches: MatchesService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get('tournament')
  getTournament() {
    return this.matches.getTournament();
  }

  @Public()
  @Get('teams')
  getTeams() {
    return this.matches.listTeams();
  }

  @Get('matches')
  list(
    @Query('stage') stage?: StageType,
    @Query('groupName') groupName?: string,
    @Query('matchday') matchday?: string,
  ) {
    return this.matches.listMatches({
      stage,
      groupName,
      matchday: matchday ? Number(matchday) : undefined,
    });
  }

  @Get('matches/upcoming')
  upcoming(
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.matches.getUpcoming(limit);
  }

  /** Manual trigger for the result sync (handy for demos / admin). */
  @Post('matches/sync')
  sync() {
    return this.matches.syncResults();
  }

  /** Carga manual de resultado (gated). Útil para correcciones / demo. */
  @Post('matches/:id/result')
  setResult(@Param('id') id: string, @Body() dto: SetResultDto) {
    if (this.config.get<string>('ENABLE_ADMIN_RESULTS') !== 'true') {
      throw new ForbiddenException('Carga manual de resultados deshabilitada');
    }
    return this.matches.setResult(id, dto.homeScore, dto.awayScore);
  }
}
