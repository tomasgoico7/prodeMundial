import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { PredictionsModule } from './predictions/predictions.module';
import { MatchesModule } from './matches/matches.module';
import { RankingsModule } from './rankings/rankings.module';
import { StatsModule } from './stats/stats.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ScoringModule } from './scoring/scoring.module';
import { FootballModule } from './football/football.module';
import { JobsModule } from './jobs/jobs.module';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL ?? 60_000),
        limit: Number(process.env.THROTTLE_LIMIT ?? 120),
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    PredictionsModule,
    MatchesModule,
    RankingsModule,
    StatsModule,
    DashboardModule,
    ScoringModule,
    FootballModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [
    // Global JWT guard — every route is protected unless marked @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global rate limiting
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
