# Phase 7 Plan: Functional Contact + Custom Google Calendar

**Phase:** 7 of 9
**Complexity:** L
**Requirements:** FR-08, D-10 (revised), D-15 (new), D-16 (new)
**Depends on:** Phase 6 ✅
**Status:** Ready to execute

---

## Goal

Contact section becomes fully functional: form sends real email, calendar shows real availability from Google Calendar, booking creates a real event with auto-invite. All v1 contact files deleted. Production-ready end-to-end contact flow.

---

## Pre-Flight Checks

- [ ] On branch `v2.0.0` with Phase 6 commits merged
- [ ] `npm run build` passes baseline
- [ ] `EMAIL_USER` + `EMAIL_PASSWORD` env vars set in `.env.local` (existing Nodemailer setup)
- [ ] No uncommitted local changes

---

## Tasks (sequential)

### Task 1 — Lock D-15 + D-16 in PROJECT.md and write SETUP.md

**Actions:**
1. Append D-15 + D-16 to PROJECT.md Key Decisions:
   > **D-15** | Calendar = real Google Calendar via service account (no Calendly embed, no static slots). Resolves Phase 7 OQ. | locked | "Homemade Calendly" — full design control, real availability, real event creation. Server-only credentials.
   > **D-16** | Timezone `America/Argentina/Buenos_Aires`. Working hours Mon-Fri 10:00-18:00. Slot 30min, buffer 15min. Env-configurable. | locked | Owner's reality; all configurable so future relocation only requires env change.
2. Write `.planning/phases/07-contact-calendar/SETUP.md` — step-by-step Google Cloud project creation, Calendar API enable, service account, JSON key, calendar sharing, env var format (with base64 for private key).
3. Commit: `docs(phase-7): lock D-15 D-16 and write Google Calendar setup guide`

**Acceptance:**
- PROJECT.md contains D-15 + D-16
- SETUP.md exists with 7+ numbered steps + env var format example
- Commit lands on v2.0.0

---

### Task 2 — Install googleapis + scaffold env types

**Actions:**
1. `cd my-app && npm install googleapis`
2. Create `.env.local.example` documenting all required env vars:
   ```
   # Existing
   EMAIL_USER=
   EMAIL_PASSWORD=
   # New (Phase 7)
   OWNER_EMAIL=
   GOOGLE_SERVICE_ACCOUNT_EMAIL=
   GOOGLE_PRIVATE_KEY_B64=
   GOOGLE_CALENDAR_ID=
   OWNER_TIMEZONE=America/Argentina/Buenos_Aires
   WORK_HOURS_START=10
   WORK_HOURS_END=18
   SLOT_DURATION_MIN=30
   SLOT_BUFFER_MIN=15
   ```
3. Add `.env.local.example` to repo (do NOT commit actual `.env.local`)
4. Commit: `feat(phase-7): install googleapis and document env vars`

**Acceptance:**
- `googleapis` in `package.json`
- `.env.local.example` committed
- `npm run build` passes

---

### Task 3 — Move EmailData type out of legacy

**Actions:**
1. Create `my-app/src/app/api/send/types.ts`:
   ```ts
   export interface EmailData {
     name: string;
     email: string;
     subject: string;
     message: string;
   }
   ```
   (NOTE: adding `email` field — required for replies; legacy didn't have it. Will be threaded through in Task 5.)
2. Edit `my-app/src/app/api/send/route.ts`:
   - Change import to `./types`
   - Add `email` to destructure
   - Update Nodemailer call: use `replyTo: email`, change `to` to `process.env.OWNER_EMAIL`
3. `npx tsc --noEmit` passes
4. Commit: `refactor(phase-7): move EmailData type to api/send/types and add email field`

**Acceptance:**
- New type file exists
- Route imports from new location
- `OWNER_EMAIL` env reads cleanly
- Build passes (legacy SendEmail.tsx still imports its own copy until Task 7)

---

### Task 4 — Build Google Calendar route library (_lib)

**Files to create:**
- `my-app/src/app/api/calendar/_lib/types.ts` — `Slot`, `BookingRequest`, `Availability` types
- `my-app/src/app/api/calendar/_lib/google.ts` — factory returning authenticated Google Calendar API client (reads env vars; decodes base64 private key)
- `my-app/src/app/api/calendar/_lib/slots.ts` — pure logic: generates all possible slots for next N days, filters by busy times from Calendar API response

**Actions:**
1. Write types file with explicit interfaces (zero `any`)
2. Write google.ts:
   ```ts
   import { google } from "googleapis";
   export function getCalendarClient() {
     const privateKey = Buffer.from(process.env.GOOGLE_PRIVATE_KEY_B64!, "base64").toString("utf-8");
     const auth = new google.auth.JWT({
       email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
       key: privateKey,
       scopes: ["https://www.googleapis.com/auth/calendar"],
     });
     return google.calendar({ version: "v3", auth });
   }
   ```
3. Write slots.ts:
   - `generateSlots(from: Date, days: number, config): Slot[]` — produces 30-min slots Mon-Fri within work hours
   - `filterAvailable(slots: Slot[], busy: BusyRange[]): Slot[]` — removes slots overlapping busy ranges + buffer
4. `npx tsc --noEmit` passes
5. Commit: `feat(phase-7): add Google Calendar client and slot-generation logic`

**Acceptance:**
- 3 files created, all typed
- Unit-testable pure functions (slots.ts has no I/O)
- Build passes

---

### Task 5 — Build /api/calendar/slots and /api/calendar/book routes

**Files to create:**
- `my-app/src/app/api/calendar/slots/route.ts`
- `my-app/src/app/api/calendar/book/route.ts`

**Actions:**
1. `slots/route.ts`:
   - `GET` handler — reads env config + auth, calls Calendar API `freebusy.query` for next 30 days, generates candidate slots, filters by busy ranges, returns `{ slots: Slot[] }`
   - 5xx error handling with safe error body
2. `book/route.ts`:
   - `POST` handler — accepts `{ slotStart: ISO, slotEnd: ISO, name, email, message? }`
   - Validates required fields (return 400 if missing)
   - Re-checks availability via `freebusy.query` for that range (return 409 if taken)
   - Calls `events.insert` with:
     - `start.dateTime`, `end.dateTime` (visitor's slot)
     - `attendees: [{ email: OWNER_EMAIL }, { email: visitor.email }]`
     - `summary: "Portfolio meeting · {visitor.name}"`
     - `description: visitor.message`
     - `reminders: { useDefault: true }`
   - Returns `{ ok: true, eventId }` or 500/409
3. `npx tsc --noEmit` passes
4. Commit: `feat(phase-7): add /api/calendar/slots and /api/calendar/book routes`

**Acceptance:**
- Both routes typed
- Build passes
- Manual smoke can be deferred to Task 9 (full system test)

---

### Task 6 — Build CalendarWidget + BookingModal components

**Files to create:**
- `my-app/src/app/components/redesign/CalendarWidget.tsx` — replaces CalendarPreview
- `my-app/src/app/components/redesign/BookingModal.tsx` — slot click modal

**Actions:**
1. `CalendarWidget.tsx`:
   - `"use client"`
   - Props: `{ onSlotClick: (slot: Slot) => void }`
   - On mount: `fetch("/api/calendar/slots")` → setState
   - Loading state: skeleton matching CalendarPreview dimensions
   - Renders month grid (current visible month):
     - Day headers (MON-SUN)
     - Day cells: available (highlighted), unavailable/past (faded)
     - Click on a day with available slots opens BookingModal (or shows slot picker)
   - Pagination: prev/next month buttons (caps at +30 days)
   - Reactive to `prefers-reduced-motion` for hover animations
2. `BookingModal.tsx`:
   - Props: `{ slot: Slot; onClose: () => void; onBooked: () => void }`
   - Form: name, email, message (optional)
   - Validates on submit
   - POSTs to `/api/calendar/book`
   - On 200: Sonner success + `onBooked()` closes modal + parent refetches slots
   - On 409: Sonner "slot just got booked" + `onClose()` (modal closes, list refreshes)
   - On 500: Sonner generic error
3. Both fully typed, no `any`
4. `npx tsc --noEmit` passes
5. Commit: `feat(phase-7): add CalendarWidget and BookingModal components`

**Acceptance:**
- 2 new component files
- Build passes
- No visual integration with Contact.tsx yet (Task 7)

---

### Task 7 — Wire redesign Contact.tsx to real backend

**File:** `my-app/src/app/components/redesign/Contact.tsx`

**Actions:**
1. Replace stub `onSubmit` with real fetch:
   ```ts
   const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     try {
       setSent(true);
       const res = await fetch("/api/send", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ name, email, subject, message }),
       });
       if (!res.ok) throw new Error("Failed to send");
       toast.success("Message sent — I'll get back to you soon.");
       setName(""); setEmail(""); setSubject(""); setMessage("");
     } catch {
       toast.error("Something went wrong. Try email directly.");
     } finally {
       setTimeout(() => setSent(false), 1500);
     }
   };
   ```
2. Add an `email` state + Field for email (currently form has name/subject/message; missing email)
3. Replace `<CalendarPreview />` with `<CalendarWidget />`
4. Import `toast` from `sonner`
5. Remove the `CalendarPreview` local component (or move it out as dead code; cleanest: delete entirely)
6. Update `ContactWrapper.tsx` to pass any new props needed (likely none — Contact is self-contained for fetch)
7. `npx tsc --noEmit` passes
8. `npm run build` passes
9. Commit: `feat(phase-7): wire Contact form to /api/send and replace CalendarPreview with CalendarWidget`

**Acceptance:**
- Contact.tsx no longer has stub submit
- Form has email field
- CalendarWidget renders instead of mockup
- Build passes

---

### Task 8 — Delete legacy contact directory

**Actions:**
1. Verify no remaining imports of `(sections)/landing/contact/*`:
   ```
   grep -r "landing/contact" my-app/src
   ```
2. Should return only `api/send/route.ts` line that already got updated in Task 3 (now imports from `./types`). If grep finds nothing, proceed.
3. Delete:
   - `my-app/src/app/(sections)/landing/contact/Contact.tsx`
   - `my-app/src/app/(sections)/landing/contact/SendEmail.tsx`
   - `my-app/src/app/(sections)/landing/contact/Adress.tsx`
   - The directory itself
   - `my-app/src/app/(sections)/landing/` (if empty)
   - `my-app/src/app/(sections)/` (if empty)
4. `npx tsc --noEmit` passes
5. `npm run build` passes
6. Commit: `chore(phase-7): delete legacy (sections)/landing/contact directory`

**Acceptance:**
- No `(sections)/landing/contact/` on disk
- Build passes — 0 broken imports

---

### Task 9 — End-to-end smoke test (USER does this)

**Prerequisite:** User completed SETUP.md → `.env.local` has all calendar vars filled.

**Verifications (browser):**
1. `npm run dev` — `/en` loads, Contact section shows real calendar
2. Calendar widget shows real availability (some days highlighted as available)
3. Click on an available day → modal opens with form
4. Submit a test booking with your test email
5. Check your Google Calendar — event appears
6. Check inbox — Google's calendar invite arrives at owner email AND visitor email
7. Try to book the same slot a second time → 409 → Sonner error
8. Test the regular contact form (separate from calendar):
   - Fill name + email + subject + message
   - Submit → Sonner success
   - Check inbox — email arrives (Nodemailer flow)
9. Test on mobile viewport (375px):
   - Calendar fits horizontally
   - Booking modal is usable
   - Form fields stack properly

**No commit yet.** Report observations for build report.

**Acceptance:**
- All 9 verification steps pass
- Any issues found get a follow-up commit before Task 10

---

### Task 10 — Build report + STATE.md

**Actions:**
1. Create `.planning/phases/07-contact-calendar/07-BUILD-REPORT.md`:
   - Files added/modified/deleted
   - tsc + build status
   - Smoke test results (all 9 steps)
   - Deviations
   - Service account setup outcome (success/issues hit)
   - Deferred items
2. Update `.planning/STATE.md` to Phase 7 done, Phase 8 next
3. Commit: `docs(phase-7): finalize build report and state`

**Acceptance:**
- Build report committed
- STATE.md reflects Phase 7 done

---

## Commit Plan (atomic)

| # | Files | Message |
|---|-------|---------|
| 1 | `PROJECT.md`, `phases/07-contact-calendar/SETUP.md` | `docs(phase-7): lock D-15 D-16 and write Google Calendar setup guide` |
| 2 | `package.json`, `.env.local.example` | `feat(phase-7): install googleapis and document env vars` |
| 3 | `api/send/types.ts`, `api/send/route.ts` | `refactor(phase-7): move EmailData type to api/send/types and add email field` |
| 4 | `api/calendar/_lib/{types,google,slots}.ts` | `feat(phase-7): add Google Calendar client and slot-generation logic` |
| 5 | `api/calendar/slots/route.ts`, `api/calendar/book/route.ts` | `feat(phase-7): add /api/calendar/slots and /api/calendar/book routes` |
| 6 | `CalendarWidget.tsx`, `BookingModal.tsx` | `feat(phase-7): add CalendarWidget and BookingModal components` |
| 7 | `Contact.tsx`, `ContactWrapper.tsx` | `feat(phase-7): wire Contact form to /api/send and replace CalendarPreview with CalendarWidget` |
| 8 | Legacy dir deletions | `chore(phase-7): delete legacy (sections)/landing/contact directory` |
| 9 | (smoke test, no commit) | — |
| 10 | `07-BUILD-REPORT.md`, `STATE.md` | `docs(phase-7): finalize build report and state` |

---

## Success Criteria (custom — ROADMAP didn't enumerate calendar)

1. ✅ Contact form posts to `/api/send` and delivers email (verified by inbox arrival)
2. ✅ CalendarWidget shows real availability from configured Google Calendar
3. ✅ Booking a slot creates a real event in Google Calendar with both parties as attendees
4. ✅ Google auto-sends invites to both attendees
5. ✅ Double-booking same slot returns 409 + Sonner error
6. ✅ All legacy `(sections)/landing/contact/` files deleted
7. ✅ `tsc --noEmit` + `npm run build` both pass

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| User can't complete Google Cloud setup | Medium | SETUP.md is thorough; user has fallback to Calendly embed if blocked (would require re-plan, but accepted exit) |
| Private key newline corruption in env var | Medium-High | Base64-encode in env; decode at runtime. Documented in SETUP.md. |
| Google API quota exceeded | Low | Portfolio has low traffic; ignored for v2.0.0 |
| Concurrency: 2 visitors book same slot | Medium | Server re-checks availability in book route; returns 409 if conflict |
| Service account email rejected as attendee | Low | Service account is the ORGANIZER, not an attendee. Real attendees are visitor + owner. |
| Visitor's email is fake | Medium | They just won't get the calendar invite. We trust the field; not our problem. |
| Calendar widget animation laggy on mobile | Low | CSS-only animations; no Framer. |
| Booking modal doesn't fit small mobile | Low | Modal uses responsive sizing (max-w-sm + max-h adapted) |
| Build pipeline breaks because of googleapis SDK size | Low | googleapis is server-side, not bundled to client |

---

## Goal-Backward Verification

**Goal:** Portfolio contact section works end-to-end in production. No v1 code remains.

Working backward:
- Visitor lands on /es or /en → reads About → wants to chat
- Option A: writes a message → form submits → owner gets email → owner replies. **Task 3-7** delivers ✓
- Option B: picks a calendar slot → fills booking form → both parties get calendar invite. **Tasks 2-6** deliver ✓
- Owner manages calendar via Google Calendar (native). No admin UI needed ✓
- Legacy v1 is gone. **Task 8** delivers ✓

---

## Out of Scope (explicitly)

- Voxel Rubik animation — Phase 8
- Framer Motion scroll triggers — Phase 8
- Lighthouse audit + Vercel deploy — Phase 9
- Phone field in booking form
- Payment/Stripe integration
- Visitor email verification
- Booking cancellation UI (use Google Calendar invite to cancel)
- Admin dashboard (Google Calendar IS the dashboard)
- Multi-language calendar day names — defer to Phase 8 polish

---

*Plan written: 2026-05-11 — manual GSD format*
