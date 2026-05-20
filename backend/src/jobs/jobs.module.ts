import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [MatchesModule],
  providers: [JobsService],
})
export class JobsModule {}
