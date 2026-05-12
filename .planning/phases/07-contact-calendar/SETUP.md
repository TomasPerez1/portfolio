# Google Calendar Setup Guide — Phase 7

**Audience:** Project owner (Tomás)
**Estimated time:** 30 minutes
**Cost:** Free (within Google Cloud free tier)

This guide walks you through creating a Google Cloud service account so the portfolio backend can read your calendar availability and create booking events on your behalf.

---

## What you'll have at the end

- A Google Cloud project with the Calendar API enabled
- A **service account** (a robot Google identity) with permission to read/write events in your calendar
- A JSON key file with credentials
- 4 environment variables ready to paste into `.env.local` and Vercel

---

## Step 1 — Create a Google Cloud project

1. Open https://console.cloud.google.com/
2. Sign in with the Google account that owns the calendar you want to use (e.g. `tomas.perez.developer@gmail.com`)
3. Top bar → click the project selector (next to "Google Cloud") → **NEW PROJECT**
4. Name it `portfolio-calendar` (any name works)
5. Click **CREATE**. Wait ~30 seconds.
6. Make sure the new project is selected in the top-bar selector.

---

## Step 2 — Enable the Google Calendar API

1. Left sidebar → **APIs & Services** → **Library**
2. Search "Google Calendar API"
3. Click the result → **ENABLE**
4. Wait until you see "API enabled".

---

## Step 3 — Create the service account

1. Left sidebar → **APIs & Services** → **Credentials**
2. Top bar → **+ CREATE CREDENTIALS** → **Service account**
3. Form:
   - **Service account name:** `portfolio-bot`
   - **Service account ID:** auto-filled (e.g. `portfolio-bot`)
   - **Description:** `Reads/writes events for the portfolio calendar`
4. Click **CREATE AND CONTINUE**
5. **Grant this service account access to project:** SKIP (no role needed; we share the calendar directly in Step 5)
6. Click **CONTINUE** → **DONE**

You should now see the service account in the credentials list. **Copy its email** — it looks like:
```
portfolio-bot@portfolio-calendar.iam.gserviceaccount.com
```
Save it somewhere — you'll need it in Step 5 and as `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

---

## Step 4 — Generate the JSON key

1. In the Credentials list, click your new service account email to open it
2. Top tabs → **KEYS**
3. **ADD KEY** → **Create new key** → choose **JSON** → **CREATE**
4. A JSON file downloads automatically. Open it in a text editor.
5. You'll see something like:
   ```json
   {
     "type": "service_account",
     "project_id": "portfolio-calendar",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n",
     "client_email": "portfolio-bot@portfolio-calendar.iam.gserviceaccount.com",
     ...
   }
   ```
6. **KEEP THIS FILE SAFE.** Anyone with it can act as your bot. Do NOT commit it to git.
7. We need TWO values from this file:
   - `client_email` (already noted in Step 3)
   - `private_key` (the long string between the BEGIN/END lines, including the newline `\n` markers)

---

## Step 5 — Share your calendar with the service account

This is the magic step that authorizes the bot to act on YOUR calendar.

1. Open https://calendar.google.com/
2. Left sidebar → "My calendars" → hover over the calendar you want bookings to land in (usually "Tomás Pérez" — your primary)
3. Click the three-dot menu → **Settings and sharing**
4. Scroll to **Share with specific people or groups**
5. Click **+ Add people and groups**
6. Paste the service account email (from Step 3)
7. **Permissions** dropdown → select **Make changes to events**
8. Click **Send**. (No actual email is sent because it's a robot account; this just grants access.)
9. Scroll down to **Integrate calendar** section
10. Copy the **Calendar ID** (looks like `tomas.perez.developer@gmail.com` for primary calendar, or a long string for secondary calendars)

---

## Step 6 — Base64-encode the private key

Vercel and most hosting providers mangle the `\n` in PEM keys when stored as env vars. Solution: base64-encode it.

**On Windows (PowerShell):**
```powershell
$key = Get-Content "path\to\downloaded.json" -Raw | ConvertFrom-Json | Select-Object -ExpandProperty private_key
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($key)) | Set-Clipboard
```
The base64 string is now in your clipboard. Paste it as `GOOGLE_PRIVATE_KEY_B64`.

**On macOS/Linux:**
```bash
cat downloaded.json | jq -r '.private_key' | base64 -w0
```
(If `jq` is not installed: `sudo apt install jq` or `brew install jq`)

---

## Step 7 — Fill `.env.local`

Open `my-app/.env.local` (create it if missing) and add:

```bash
# Existing — keep
EMAIL_USER=tomas.perez.developer@gmail.com
EMAIL_PASSWORD=<your existing app password>

# New — Phase 7
OWNER_EMAIL=tomas.perez.developer@gmail.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=portfolio-bot@portfolio-calendar.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY_B64=<paste the long base64 string from Step 6>
GOOGLE_CALENDAR_ID=<paste the Calendar ID from Step 5 — likely your gmail address>

# Optional overrides (defaults shown)
OWNER_TIMEZONE=America/Argentina/Buenos_Aires
WORK_HOURS_START=10
WORK_HOURS_END=18
SLOT_DURATION_MIN=30
SLOT_BUFFER_MIN=15
```

**Vercel deploy:** same env vars in **Project Settings → Environment Variables** → add each one.

---

## Step 8 — Verify (smoke test, after Phase 7 code lands)

After running `npm run dev`:

1. Open `http://localhost:3000/en` → scroll to Contact
2. The CalendarWidget should fetch real availability (some days highlighted)
3. Click an available day → modal opens
4. Fill in `name`, your test `email`, optional `message`, click **Book**
5. Check your Google Calendar — a new event titled "Portfolio meeting · {your name}" should appear at the chosen time
6. Check both your inbox AND the test email's inbox — Google should auto-send calendar invites

If anything fails, check:
- Terminal logs for backend errors
- `.env.local` has all 4 required vars
- Service account is shared on the calendar with "Make changes to events"
- Calendar API is enabled

---

## Security checklist

- [ ] `.env.local` is in `.gitignore` (default in Next.js)
- [ ] The downloaded JSON key is NOT committed to git
- [ ] The service account has only Calendar API access (no other permissions)
- [ ] In production (Vercel), env vars are set per-environment (preview vs production)

---

## What can go wrong

| Symptom | Cause | Fix |
|---------|-------|-----|
| `error:0909006C:PEM routines:get_name:no start line` | Private key newlines lost | Verify GOOGLE_PRIVATE_KEY_B64 was base64-encoded correctly |
| `Permission denied` from Calendar API | Service account not shared on calendar | Re-do Step 5; check "Make changes to events" permission |
| `Calendar not found` | Wrong `GOOGLE_CALENDAR_ID` | Re-copy from Calendar settings → Integrate section |
| `invalid_grant` | Service account JSON key was rotated/deleted | Generate a new key, update env vars |
| Event created but no invite emails | Calendar API quota OR Gmail SMTP issue | Check Google Cloud quotas page |

---

## When to revisit this guide

- Changing the calendar (e.g. moving to a dedicated `bookings@` calendar)
- Rotating service account credentials (good practice every 6-12 months)
- Adding additional permissions (e.g. read other Google services)

---

*Setup guide written: 2026-05-11 — Phase 7*
