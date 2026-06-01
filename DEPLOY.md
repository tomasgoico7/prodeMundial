# Despliegue en Azure

Guía para desplegar la app en **Azure Container Apps** (backend + frontend) con
**Azure Database for PostgreSQL Flexible Server** y **Azure Container Registry**.

```
┌──────────────┐     ┌──────────────────────────┐
│  Frontend    │────▶│  Backend (NestJS API)     │
│  (Next.js)   │     │                            │
│ Container App│     │      Container App         │
└──────────────┘     └────────────┬──────────────┘
                                   │
                          ┌────────▼────────┐
                          │  PostgreSQL      │
                          │  Flexible Server │
                          └─────────────────┘
   Imágenes en Azure Container Registry (ACR)
```

> Requisitos: una cuenta de Azure y el [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
> (`az login`). No hace falta Docker local: las imágenes se construyen en ACR.

Definí variables para reutilizar en los comandos:

```bash
RG=prode-rg
LOC=eastus
ACR=prodeacr$RANDOM          # debe ser único y en minúsculas
PG=prode-pg-$RANDOM          # nombre del servidor Postgres
PG_USER=prodeadmin
PG_PASS='Cambiar_Esto_123!'  # fuerte
PG_DB=prode
```

## 1. Grupo de recursos

```bash
az group create -n $RG -l $LOC
```

## 2. PostgreSQL Flexible Server

```bash
az postgres flexible-server create \
  -g $RG -n $PG -l $LOC \
  --admin-user $PG_USER --admin-password "$PG_PASS" \
  --tier Burstable --sku-name Standard_B1ms \
  --storage-size 32 --version 16 \
  --public-access 0.0.0.0   # permite servicios de Azure; ajustar si querés más estricto

az postgres flexible-server db create -g $RG -s $PG -d $PG_DB
```

`DATABASE_URL` (Prisma necesita `sslmode=require`):

```
postgresql://PG_USER:PG_PASS@PG.postgres.database.azure.com:5432/PG_DB?sslmode=require&schema=public
```

## 3. Container Registry y build de imágenes

```bash
az acr create -g $RG -n $ACR --sku Basic --admin-enabled true

# Backend
az acr build -r $ACR -t prode-backend:latest ./backend

# Frontend — el backend ya tiene que existir para conocer su URL (paso 5).
# Reconstruí este paso DESPUÉS de tener BACKEND_URL (ver paso 6).
```

## 4. Entorno de Container Apps

```bash
az extension add --name containerapp --upgrade
az containerapp env create -g $RG -n prode-env -l $LOC
```

## 5. Backend

```bash
az containerapp create \
  -g $RG -n prode-backend --environment prode-env \
  --image $ACR.azurecr.io/prode-backend:latest \
  --registry-server $ACR.azurecr.io \
  --target-port 4000 --ingress external \
  --min-replicas 1 --max-replicas 1 \
  --secrets db-url="postgresql://$PG_USER:$PG_PASS@$PG.postgres.database.azure.com:5432/$PG_DB?sslmode=require&schema=public" \
            jwt-secret="$(openssl rand -base64 48)" \
            smtp-pass="TU_SMTP_KEY" \
  --env-vars \
     DATABASE_URL=secretref:db-url \
     JWT_SECRET=secretref:jwt-secret \
     JWT_EXPIRES_IN=7d \
     PORT=4000 \
     FOOTBALL_PROVIDER=openfootball \
     RESULTS_POLL_CRON="*/5 * * * *" \
     ENABLE_ADMIN_RESULTS=false \
     THROTTLE_LIMIT=120 AUTH_REGISTER_LIMIT=5 AUTH_LOGIN_LIMIT=10 \
     MAIL_ETHEREAL=false \
     SMTP_HOST=smtp-relay.brevo.com SMTP_PORT=587 SMTP_SECURE=false \
     SMTP_USER=TU_LOGIN_SMTP SMTP_PASS=secretref:smtp-pass \
     "MAIL_FROM=El Prode de la Gambeta <no-reply@tu-dominio.com>"

# Guardá la URL pública del backend:
BACKEND_URL=https://$(az containerapp show -g $RG -n prode-backend --query properties.configuration.ingress.fqdn -o tsv)
echo $BACKEND_URL
```

> El contenedor aplica el schema (`prisma db push`) y siembra equipos/partidos
> al arrancar (idempotente: no pisa resultados ya cargados).

## 6. Frontend

`NEXT_PUBLIC_API_URL` se hornea en el build, así que hay que construir la imagen
con la URL real del backend:

```bash
az acr build -r $ACR -t prode-frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL ./frontend

az containerapp create \
  -g $RG -n prode-frontend --environment prode-env \
  --image $ACR.azurecr.io/prode-frontend:latest \
  --registry-server $ACR.azurecr.io \
  --target-port 3000 --ingress external \
  --min-replicas 1 --max-replicas 2

FRONTEND_URL=https://$(az containerapp show -g $RG -n prode-frontend --query properties.configuration.ingress.fqdn -o tsv)
echo $FRONTEND_URL
```

## 7. CORS

Ya con la URL del frontend, actualizá el backend para permitirla:

```bash
az containerapp update -g $RG -n prode-backend \
  --set-env-vars CORS_ORIGIN=$FRONTEND_URL
```

Listo: abrí `$FRONTEND_URL`.

## Notas

- **Email (Brevo): IPs autorizadas.** Si en Brevo tenés activadas "Authorized
  IPs", agregá la IP de salida del entorno de Container Apps (o desactivá la
  restricción). La IP de salida la ves con:
  `az containerapp env show -g $RG -n prode-env --query properties.staticIp -o tsv`.
- **Secretos.** `JWT_SECRET`, password de la DB y `SMTP_PASS` van como *secrets*
  del Container App (como arriba), nunca en el código ni en el repo.
- **Dominio propio.** Agregá un custom domain + certificado administrado en el
  Container App del frontend (`az containerapp hostname add` / `bind`), y
  actualizá `CORS_ORIGIN` y `MAIL_FROM` en consecuencia.
- **Actualizar la app.** Reconstruí la imagen (`az acr build ...`) y luego
  `az containerapp update -g $RG -n <app> --image $ACR.azurecr.io/<img>:latest`.
- **Costo.** Postgres Burstable B1ms + dos Container Apps con 1 réplica es la
  configuración más económica para empezar.
