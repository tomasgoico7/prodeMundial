import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MatchesService } from '../matches/matches.service';

/**
 * Automatic results-polling job. On a configurable cron schedule it asks the
 * active football provider for new results; finished matches trigger score
 * and ranking recalculation downstream (see MatchesService.syncResults).
 */
@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly matches: MatchesService,
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    const cronExpr = this.config.get<string>('RESULTS_POLL_CRON', '*/5 * * * *');
    const job = new CronJob(cronExpr, () => {
      void this.pollResults();
    });
    this.scheduler.addCronJob('poll-results', job);
    job.start();
    this.logger.log(`Results polling scheduled: "${cronExpr}"`);

    // Run once shortly after boot so the demo has data quickly.
    setTimeout(() => void this.pollResults(), 10_000);
  }

  private async pollResults(): Promise<void> {
    try {
      const { updated, finished } = await this.matches.syncResults();
      if (updated) {
        this.logger.log(`Poll complete — ${updated} updated, ${finished} finished`);
      }
    } catch (err) {
      this.logger.error('Result polling failed', (err as Error).stack);
    }
  }
}
