# El Prode de la Gambeta

Prode (pool de predicciones) del **Mundial FIFA 2026**, para jugar con amigos y
compañeros de trabajo. Permite crear grupos privados con código de invitación,
cargar pronósticos por fases, competir en rankings y ver estadísticas.

## Stack

**Frontend** — Next.js 15 (App Router), TypeScript, TailwindCSS, componentes
shadcn-style, TanStack Query, Zustand, React Hook Form + Zod.

**Backend** — NestJS, TypeScript, Prisma, PostgreSQL, autenticación JWT
(email/contraseña con hash bcrypt).

**Infra** — Docker / Docker Compose. Datos del torneo desde
[openfootball](https://github.com/openfootball/worldcup.json) (fixture oficial,
gratis). Emails vía SMTP (Brevo / Resend / Gmail).

## Puesta en marcha (Docker)

```bash
cp .env.example .env   # completá los valores
docker compose up --build
```

- Frontend → http://localhost:3100
- API → http://localhost:4000/api
- Health → http://localhost:4000/api/health

Para reiniciar la base desde cero:

```bash
docker compose down -v && docker compose up --build
```

## Desarrollo local (sin Docker)

Requiere Node 20+ y un PostgreSQL accesible.

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run start:dev

# Frontend (en otra terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Variables de entorno

Ver `.env.example` (raíz, para Docker) y los `.env.example` de `backend/` y
`frontend/`. Las más importantes:

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Secreto para firmar los JWT. Usar uno largo y aleatorio en prod. |
| `CORS_ORIGIN` | Origen(es) permitido(s) por CORS (el dominio del frontend). |
| `FOOTBALL_PROVIDER` | `openfootball` (real, gratis), `api-football` o `static`. |
| `RESULTS_POLL_CRON` | Frecuencia del job de resultados (cron). |
| `ENABLE_ADMIN_RESULTS` | Habilita la carga manual de resultados. En prod: `false`. |
| `THROTTLE_LIMIT` / `AUTH_*_LIMIT` | Rate limiting. |
| `SMTP_*` / `MAIL_FROM` | Envío de emails (invitaciones y avisos de fase). |
| `NEXT_PUBLIC_API_URL` | URL pública de la API (la usa el frontend). |

> En desarrollo, el frontend detecta automáticamente el host desde el que se
> abre (puerto 4000), así funciona desde la PC y desde otro dispositivo en la
> misma red sin reconstruir. En producción, definí `NEXT_PUBLIC_API_URL`.

## Modelo de predicción (por fases)

El prode se completa por etapas. Cada fase se habilita cuando se conocen los
rivales y se firma por separado:

1. **Fase de grupos** + elección del **campeón**.
2. **Dieciseisavos** (se habilita al terminar la fase de grupos).
3. **Octavos** → **Cuartos** → **Semifinales** → **Final + tercer puesto**.

Una vez que una fase arranca (tiene resultados cargados), queda cerrada para
edición. Al habilitarse una fase, se notifica por email a los participantes.

## Sistema de puntaje

| Acierto | Puntos |
|---|---|
| Resultado exacto | 3 |
| Ganador / empate (sin el exacto) | 1 |
| Campeón del mundo | 10 |

Configurable en `backend/src/common/constants/scoring.constants.ts`.

## Datos de fútbol

El proveedor está desacoplado (`backend/src/football`). Por defecto usa
**openfootball** (fixture y resultados reales del Mundial 2026, sin API key).
El bracket de eliminatorias se resuelve con la estructura oficial (1°/2° de
grupo y mejores terceros).

## Testing

```bash
cd backend && npm run test        # unit
cd backend && npm run test:e2e    # e2e (requiere DATABASE_URL)
```

## Despliegue

Ver [`DEPLOY.md`](./DEPLOY.md) para la guía de despliegue en Azure
(Container Apps + Azure Database for PostgreSQL).

## Licencia

MIT.
