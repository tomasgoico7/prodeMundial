import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { FootballModule } from '../football/football.module';
import { ScoringModule } from '../scoring/scoring.module';
import { BracketModule } from '../bracket/bracket.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [FootballModule, ScoringModule, BracketModule, NotificationsModule],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
