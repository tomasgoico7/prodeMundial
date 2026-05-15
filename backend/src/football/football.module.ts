import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FOOTBALL_PROVIDER } from './football-provider.interface';
import { StaticFootballProvider } from './static-football.provider';
import { ApiFootballProvider } from './api-football.provider';
import { OpenFootballProvider } from './openfootball.provider';

/**
 * Selects the active football provider at runtime based on FOOTBALL_PROVIDER:
 *   - "openfootball" (default): resultados reales y gratuitos (sin API key)
 *   - "api-football": API-Sports (requiere FOOTBALL_API_KEY y plan con 2026)
 *   - "static": simulador offline (genera resultados ficticios para demo)
 * Swapping providers is a one-line env change — no code edits required.
 */
@Module({
  providers: [
    StaticFootballProvider,
    ApiFootballProvider,
    OpenFootballProvider,
    {
      provide: FOOTBALL_PROVIDER,
      inject: [
        ConfigService,
        StaticFootballProvider,
        ApiFootballProvider,
        OpenFootballProvider,
      ],
      useFactory: (
        config: ConfigService,
        staticProvider: StaticFootballProvider,
        apiProvider: ApiFootballProvider,
        openProvider: OpenFootballProvider,
      ) => {
        const provider = config.get<string>('FOOTBALL_PROVIDER', 'openfootball');
        if (provider === 'api-football') return apiProvider;
        if (provider === 'static') return staticProvider;
        return openProvider;
      },
    },
  ],
  exports: [FOOTBALL_PROVIDER],
})
export class FootballModule {}
