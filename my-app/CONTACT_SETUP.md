# Contact Section — Setup Guide

Guía paso a paso para dejar **100% funcional** la sección de contacto del portfolio.

La sección tiene **dos integraciones independientes**:

1. **Formulario de contacto** → manda mails vía **Resend**
2. **Booking de reuniones** → lee disponibilidad y crea eventos en **Google Calendar** vía Service Account

WhatsApp, mailto y Google Maps son links directos (no requieren credenciales).

---

## 0 · Variables de entorno — resumen

Creá un archivo `.env.local` en la raíz del proyecto (al lado de `package.json`). **Nunca lo subas a git** (ya está en `.gitignore`).

```bash
# === Resend (formulario de contacto) ===
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM=Portfolio <onboarding@resend.dev>
OWNER_EMAIL=tomas.perez.developer@gmail.com

# === Google Calendar (booking de reuniones) ===
GOOGLE_SERVICE_ACCOUNT_EMAIL=portfolio-booking@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY_B64=LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t...
GOOGLE_CALENDAR_ID=tu-calendar-id@group.calendar.google.com

# === Configuración de horarios (opcional, tiene defaults) ===
OWNER_TIMEZONE=America/Argentina/Buenos_Aires
WORK_HOURS_START=10
WORK_HOURS_END=18
SLOT_DURATION_MIN=30
SLOT_BUFFER_MIN=15
```

| Variable | Usado por | Obligatorio |
|----------|-----------|-------------|
| `RESEND_API_KEY` | `/api/send` | ✅ |
| `RESEND_FROM` | `/api/send` | ⚠️ recomendado (default: `onboarding@resend.dev`) |
| `OWNER_EMAIL` | `/api/send` + `/api/calendar/book` | ✅ |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `/api/calendar/*` | ✅ |
| `GOOGLE_PRIVATE_KEY_B64` | `/api/calendar/*` | ✅ |
| `GOOGLE_CALENDAR_ID` | `/api/calendar/*` | ✅ |
| `OWNER_TIMEZONE` | `/api/calendar/*` | ⚠️ default: `America/Argentina/Buenos_Aires` |
| `WORK_HOURS_START` | `/api/calendar/*` | ⚠️ default: `10` |
| `WORK_HOURS_END` | `/api/calendar/*` | ⚠️ default: `18` |
| `SLOT_DURATION_MIN` | `/api/calendar/*` | ⚠️ default: `30` |
| `SLOT_BUFFER_MIN` | `/api/calendar/*` | ⚠️ default: `15` |

---

## 1 · Resend — Formulario de contacto

### 1.1 · Crear cuenta

1. Andá a https://resend.com
2. **Sign up** con email o GitHub
3. Verificá tu email

**Free tier**: 3.000 emails/mes · 100/día. Más que suficiente para un portfolio.

### 1.2 · Generar API Key

1. Dashboard → **API Keys** (sidebar izquierdo)
2. Click **Create API Key**
3. Nombre: `portfolio-production` (o el que quieras)
4. Permission: **Sending access** (no necesitás Full access)
5. Domain: dejá **All domains** por ahora
6. Click **Add**
7. **COPIÁ LA KEY AHORA** (empieza con `re_...`). No la vas a poder ver de nuevo.

### 1.3 · Configurar sender — DOS opciones

#### Opción A · Sandbox (rápido, sin dominio propio)

Si todavía no tenés dominio o querés probar rápido:

```bash
RESEND_FROM=Portfolio <onboarding@resend.dev>
```

⚠️ **Limitación importante del sandbox**: Resend SOLO permite enviar mails al email con el que te registraste. Si alguien más llena el form, **no le va a llegar nada al `OWNER_EMAIL`** salvo que coincida con tu email de Resend.

→ Sirve para testear vos mismo. Para producción real, pasá a la Opción B.

#### Opción B · Dominio propio verificado (producción)

1. Dashboard → **Domains** → **Add Domain**
2. Ingresá tu dominio (ej: `tomasperez.dev`)
3. Resend te muestra ~4 registros DNS para agregar:
   - **SPF** (TXT)
   - **DKIM** (TXT, generalmente 3 registros)
   - **MX** (opcional, solo si querés recibir)
4. Andá a tu proveedor de DNS (Cloudflare, Namecheap, GoDaddy, Vercel DNS, etc.) y agregá los registros **tal cual** te los muestra Resend
5. Volvé a Resend → **Verify DNS Records**
6. Esperá la propagación (5min - 24hs, casi siempre <1h)
7. Cuando aparezca **Verified** ✅:

```bash
RESEND_FROM=Tomas Perez <hello@tomasperez.dev>
```

### 1.4 · Configurar el .env.local

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM=Portfolio <onboarding@resend.dev>   # o tu dominio
OWNER_EMAIL=tu-email@donde-querés-recibir.com
```

### 1.5 · Probar localmente

```powershell
npm run dev
```

1. Abrí http://localhost:3000
2. Andá a la sección Contact
3. Llená el formulario con datos reales
4. Submit
5. Verificá:
   - ✅ Toast verde de éxito en la web
   - ✅ Mail llegado a `OWNER_EMAIL`
   - ✅ Subject prefijado con `[Portfolio]`

**Si falla**: abrí DevTools → Network → mirá la response de `/api/send`. Los errores comunes:
- `missing RESEND_API_KEY` → no leyó el `.env.local` (reiniciá `npm run dev`)
- `Resend send failed` → key inválida o sender no verificado
- En sandbox, mail destino ≠ tu email Resend → cambiá a dominio verificado

---

## 2 · Google Calendar — Booking de reuniones

El sistema usa una **Service Account** (no OAuth de usuario), así que el visitante NO necesita logearse. Tu calendario comparte permisos con la cuenta de servicio y listo.

### 2.1 · Crear proyecto en Google Cloud

1. Andá a https://console.cloud.google.com
2. Click en el selector de proyectos arriba → **New Project**
3. Nombre: `portfolio-booking` (o el que prefieras)
4. Click **Create**
5. Esperá unos segundos y seleccioná el proyecto recién creado

### 2.2 · Habilitar Google Calendar API

1. Sidebar → **APIs & Services** → **Library**
2. Buscá "Google Calendar API"
3. Click → **Enable**

### 2.3 · Crear Service Account

1. Sidebar → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. **Service account name**: `portfolio-booking`
4. **Service account ID**: se autocompleta (ej: `portfolio-booking`)
5. Click **Create and Continue**
6. **Grant this service account access** → dejalo vacío, click **Continue**
7. **Grant users access** → vacío, click **Done**

Vas a ver tu service account con un email tipo:
```
portfolio-booking@your-project-id.iam.gserviceaccount.com
```

**Copiá ese email** → es tu `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

### 2.4 · Generar la Private Key (JSON)

1. Click en la service account recién creada
2. Tab **Keys** → **Add Key** → **Create new key**
3. Tipo: **JSON**
4. Click **Create**
5. Se descarga un archivo `.json` — **guardalo bien, no se puede regenerar el contenido**

⚠️ **NUNCA commitees este archivo**. Si te queda en el repo, agregalo a `.gitignore`.

### 2.5 · Convertir la Private Key a Base64

El código espera la key en **Base64** (para evitar problemas con saltos de línea en env vars).

Abrí el JSON descargado y vas a ver un campo `"private_key"` largo. Hay dos formas de convertirlo:

#### Opción A · PowerShell (Windows — recomendado para vos)

```powershell
# Reemplazá la ruta con la del JSON que descargaste
$json = Get-Content "C:\Downloads\portfolio-booking-xxxxx.json" -Raw | ConvertFrom-Json
$pk = $json.private_key
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($pk)) | Set-Clipboard
Write-Host "Base64 copiado al portapapeles."
```

Pegá el resultado en `.env.local` como `GOOGLE_PRIVATE_KEY_B64=...`.

#### Opción B · Node.js inline

```powershell
node -e "console.log(Buffer.from(require('./portfolio-booking-xxxxx.json').private_key).toString('base64'))"
```

### 2.6 · Crear el calendario dedicado

**Recomendación FUERTE**: no uses tu calendario personal. Creá uno aparte solo para bookings del portfolio.

1. Andá a https://calendar.google.com
2. Sidebar izquierdo → **Other calendars** → `+` → **Create new calendar**
3. **Name**: `Portfolio Bookings`
4. **Time zone**: la tuya (ej: `America/Argentina/Buenos_Aires`)
5. Click **Create calendar**

### 2.7 · Compartir el calendario con la Service Account

Este es el paso que TODO el mundo olvida y por eso falla. **PRESTÁ ATENCIÓN.**

1. En Google Calendar, sidebar → encontrá `Portfolio Bookings`
2. Hover → click los tres puntos `⋮` → **Settings and sharing**
3. Scroll hasta **Share with specific people or groups** → **Add people and groups**
4. Pegá el email de la service account (`portfolio-booking@...iam.gserviceaccount.com`)
5. **Permissions**: **Make changes to events** ← ⚠️ obligatorio (necesita crear eventos)
6. Click **Send**

### 2.8 · Obtener el Calendar ID

1. Misma página de **Settings and sharing** del calendario
2. Scroll hasta **Integrate calendar**
3. Copiá el **Calendar ID** — se ve así:
   ```
   abc123def456@group.calendar.google.com
   ```
4. Eso es tu `GOOGLE_CALENDAR_ID`.

### 2.9 · Configurar el .env.local

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=portfolio-booking@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY_B64=LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t...   # ← lo del paso 2.5
GOOGLE_CALENDAR_ID=abc123def456@group.calendar.google.com
OWNER_EMAIL=tu-email@donde-querés-recibir.com

# Opcionales (tienen defaults)
OWNER_TIMEZONE=America/Argentina/Buenos_Aires
WORK_HOURS_START=10        # 10:00am
WORK_HOURS_END=18          # 18:00 (6pm)
SLOT_DURATION_MIN=30       # slots de 30 minutos
SLOT_BUFFER_MIN=15         # 15min de buffer entre reuniones
```

### 2.10 · Probar localmente

```powershell
npm run dev
```

1. Abrí http://localhost:3000 → Contact
2. El **CalendarWidget** debería cargar slots disponibles (próximos 30 días)
3. Click en un slot → abre **BookingModal**
4. Completá nombre + email + mensaje → **Confirm**
5. Verificá:
   - ✅ Toast de éxito
   - ✅ Evento creado en `Portfolio Bookings` en Google Calendar
   - ✅ Invitación enviada a ambos emails (vos como `OWNER_EMAIL` + el visitante)
   - ✅ El slot ya no aparece disponible si refrescás

**Errores comunes**:
- `Missing GOOGLE_*` → no leyó `.env.local`, reiniciá dev server
- `Not Found` en logs → calendar ID mal, o no compartiste con la service account
- `Forbidden` → permission del share no era "Make changes to events"
- `invalid_grant` → la private key está mal codificada en Base64 (rehacé el paso 2.5)

---

## 3 · Deploy a Vercel

### 3.1 · Configurar variables de entorno en Vercel

1. Andá a https://vercel.com → tu proyecto
2. **Settings** → **Environment Variables**
3. Para CADA variable de `.env.local`:
   - **Key**: nombre exacto (ej: `RESEND_API_KEY`)
   - **Value**: el valor
   - **Environments**: marcá **Production**, **Preview** y **Development**
4. Click **Save** por cada una

⚠️ Para `GOOGLE_PRIVATE_KEY_B64` pegá el string Base64 **completo, en una sola línea**, sin saltos.

### 3.2 · Redeploy

Después de agregar las env vars:
1. **Deployments** tab → último deployment → `⋮` → **Redeploy**
2. O hacé un push nuevo a la branch para triggear deploy

### 3.3 · Verificar en producción

1. Andá a tu URL de Vercel
2. Repetí los tests de las secciones 1.5 y 2.10
3. Si algo falla → **Vercel Dashboard** → **Logs** → mirá la response del endpoint que falló

---

## 4 · Mantenimiento y seguridad

### Rotar credenciales si se filtraron
- **Resend**: Dashboard → API Keys → revoke + crear nueva
- **Google**: Cloud Console → Credentials → Service Account → Keys → delete + create new → rehacé el paso 2.5

### Archivos a NUNCA commitear
- `.env.local`
- `.env.production`
- Cualquier `*.json` de service account
- Verificá que estén en `.gitignore`

### Monitoreo
- **Resend**: dashboard te muestra emails enviados, bounces y complaints
- **Google Calendar**: revisá periódicamente que los eventos se creen bien

---

## 5 · Checklist final

Antes de decir "está funcional", verificá:

- [ ] `.env.local` creado y NO en git
- [ ] Resend: cuenta creada, API key generada
- [ ] Resend: sender configurado (sandbox o dominio verificado)
- [ ] Resend: mail de prueba recibido localmente
- [ ] Google Cloud: proyecto + Calendar API habilitada
- [ ] Google Cloud: service account creada con JSON descargado
- [ ] Private key convertida a Base64 correctamente
- [ ] Calendario dedicado creado en Google Calendar
- [ ] Calendario compartido con service account (permiso "Make changes to events")
- [ ] Calendar ID copiado al `.env.local`
- [ ] Booking de prueba creado localmente → aparece en Google Calendar
- [ ] Todas las env vars cargadas en Vercel (Production + Preview + Development)
- [ ] Redeploy hecho post env vars
- [ ] Tests de form + booking pasados en producción

Cuando todo esté tildado: **el contacto está LIVE**. 🚀
