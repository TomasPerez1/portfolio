# Phase 7: Functional Contact + Custom Google Calendar

**Gathered:** 2026-05-11
**Status:** Ready for planning
**Source:** Manual draft (gsd-sdk unavailable)

<domain>
## Phase Boundary

Make the redesign Contact section fully functional: (1) form sends real email via existing Nodemailer infrastructure, (2) calendar widget reads availability from a real Google Calendar via service account, (3) clicking a slot books a real event + sends confirmation emails. Eliminate the remaining legacy `(sections)/landing/contact/` directory after porting the email type. Done = portfolio has zero v1 components and contact section works end-to-end in production.

**In scope:**
- Move `EmailData` interface from legacy `SendEmail.tsx` to a shared location (`src/app/api/send/types.ts`)
- Update `api/send/route.ts` import path
- Wire redesign `Contact.tsx` form submit to POST `/api/send` via fetch (replace stub)
- Sonner toasts for form success/error (visible feedback)
- Install `googleapis` npm package
- Create `/api/calendar/slots` GET route — reads next-30-day availability from a Google Calendar via service account
- Create `/api/calendar/book` POST route — creates event in calendar + emails visitor + emails owner
- Replace `CalendarPreview` mockup in `Contact.tsx` with `CalendarWidget` that:
  - Fetches real availability on mount
  - Renders month grid with available/unavailable slots
  - Click on slot → opens booking modal (form: name, email, message, confirm)
  - Submit → POST `/api/calendar/book` → Sonner toast → close modal
- Delete `(sections)/landing/contact/` directory once email type ported
- Document service account setup in `.planning/phases/07-contact-calendar/SETUP.md` (user-followed instructions)
- Add D-15 (calendar approach) and D-16 (timezone + working hours) to PROJECT.md

**Out of scope:**
- Voxel Rubik animation — Phase 8
- Framer Motion scroll triggers — Phase 8
- Performance audit, Lighthouse, deploy — Phase 9
- Payment integration (this is a scheduling tool, not a paid booking system)
- Recurring slot management UI (working hours configured via env vars, not UI)
- Visitor email verification (we trust the email field; no double-opt-in)

</domain>

<decisions>
## Implementation Decisions

### Locked from PROJECT.md / ROADMAP
- **D-10**: Keep Nodemailer + Calendly + Sonner — Phase 7 only reskins UI. Nodemailer survives; Calendly REPLACED by custom Google Calendar (revised decision below).

### Phase-7 specific (decided 2026-05-11 with user)
- **D-15 (to be locked)**: Calendar = Google Calendar API via service account. NOT Calendly embed, NOT static slots. Real availability sync + real event creation. Service account JSON in env vars.
- **D-16 (to be locked)**: Timezone `America/Argentina/Buenos_Aires`. Working hours `Mon-Fri 10:00-18:00`. Slot duration 30min. Buffer 15min between meetings. All configurable via env vars (defaults documented).
- **Phase split**: Phase 7 covers BOTH contact form wiring AND calendar (user chose unified scope over split).
- **Email approach**: Nodemailer SMTP Gmail (existing setup). New routes `api/calendar/*` reuse same transporter pattern.
- **Calendar widget UI**: Replace `CalendarPreview` mockup in-place. Match design aesthetic (rounded card, mono fonts, spark color for highlights). Modal opens IN-CONTEXT (no full-page modal).
- **Booking confirmation**: Server creates calendar event with `attendees: [visitor email, owner email]`. Google Calendar auto-sends invites to attendees (uses Google's mail; no Nodemailer for invites). Nodemailer is for the standalone contact form, separate flow.
- **Concurrency**: At booking time, server re-checks availability before creating event. If slot taken between fetch and submit, return 409 error → Sonner shows "Slot just got booked, pick another."
- **Visitor identity**: Booking form requires name + email + optional message. Email is used as attendee + recipient.
- **Auth boundary**: Service account credentials are SERVER-SIDE ONLY. Never exposed to client. Frontend talks to our routes; routes talk to Google.
- **Env var split**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (base64-encoded to survive newlines in Vercel env), `GOOGLE_CALENDAR_ID` (which calendar to read/write), `OWNER_TIMEZONE`, `WORK_HOURS_START`, `WORK_HOURS_END`, `SLOT_DURATION_MIN`, `SLOT_BUFFER_MIN`.
- **Legacy deletion**: `(sections)/landing/contact/SendEmail.tsx` had `EmailData` type — port to `api/send/types.ts`. Then delete entire `(sections)/landing/contact/` directory. `(sections)/landing/` becomes empty → delete that too.

### Claude's Discretion
- Whether to use Google's auto-invite or send our own email — use Google's auto-invite (cleaner, native calendar UX, fewer code paths to maintain)
- Whether to add `phone` field to booking form — NO, keep email-only for v2.0.0
- Whether to show booked slots as "taken" or simply hide them — show as visually disabled (grayed out) so visitors see density
- Whether calendar shows future weeks via pagination or all-in-one scroll — pagination (prev/next month buttons)

</decisions>

<canonical_refs>
## Canonical References

### Project specs
- `.planning/PROJECT.md` — D-10 (Nodemailer+Calendly+Sonner). To be amended with D-15, D-16.
- `.planning/REQUIREMENTS.md` — FR-08 (Contact form delivers email), FR-09 (Calendar booking — assumed; may need adding)
- `.planning/ROADMAP.md` — Phase 7 goal

### Existing infrastructure (preserved)
- `my-app/src/app/api/send/route.ts` — Nodemailer SMTP Gmail transport (works; just needs import fix when SendEmail.tsx deleted)
- ENV vars: `EMAIL_USER`, `EMAIL_PASSWORD` (already set in deployment)
- `sonner` package — already installed; `<Toaster>` mounted in `layout.tsx`

### Files to modify
1. `my-app/src/app/api/send/route.ts` — update `EmailData` import
2. `my-app/src/app/components/redesign/Contact.tsx` — wire onSubmit to fetch /api/send + toast, swap CalendarPreview for CalendarWidget
3. `my-app/src/app/components/redesign/wrappers/ContactWrapper.tsx` — remove the "stub" comment (no longer stub)
4. `.planning/PROJECT.md` — append D-15, D-16

### Files to create
1. `my-app/src/app/api/send/types.ts` — `EmailData` interface (moved from legacy)
2. `my-app/src/app/api/calendar/slots/route.ts` — GET availability
3. `my-app/src/app/api/calendar/book/route.ts` — POST booking
4. `my-app/src/app/api/calendar/_lib/google.ts` — shared Google Calendar client factory
5. `my-app/src/app/api/calendar/_lib/slots.ts` — pure logic for generating possible slots + filtering by busy times
6. `my-app/src/app/api/calendar/_lib/types.ts` — `Slot`, `BookingRequest`, shared types
7. `my-app/src/app/components/redesign/CalendarWidget.tsx` — replaces `CalendarPreview`
8. `my-app/src/app/components/redesign/BookingModal.tsx` — slot-click modal
9. `.planning/phases/07-contact-calendar/SETUP.md` — service account setup guide for user
10. `.env.local.example` — document new env vars

### Files to delete
- `my-app/src/app/(sections)/landing/contact/SendEmail.tsx`
- `my-app/src/app/(sections)/landing/contact/Adress.tsx`
- `my-app/src/app/(sections)/landing/contact/Contact.tsx` (v1)
- `my-app/src/app/(sections)/landing/contact/` (the directory)
- `my-app/src/app/(sections)/landing/` (parent, if empty)
- Possibly `my-app/src/app/(sections)/` (if empty)

</canonical_refs>

<specifics>
## Specific Risks & Notes

- **Service account setup** is the biggest external dependency. User has to: (a) create Google Cloud project, (b) enable Calendar API, (c) create service account, (d) download JSON key, (e) share their calendar with the service account email, (f) extract `client_email` and `private_key` from JSON. We need a SETUP.md walking them through each step with screenshots-via-text. Estimated ~30min user effort.
- **`private_key` newline preservation**: Vercel env vars don't preserve `\n` in PEM-formatted keys. Standard fix: base64-encode the key in env, decode at runtime. Document in SETUP.md.
- **Calendar timezone**: Google Calendar API works in UTC; we convert to/from `America/Argentina/Buenos_Aires` at the route layer. Use `Intl.DateTimeFormat` or `Temporal` (Node 22+). Defensive: validate `OWNER_TIMEZONE` env var at boot.
- **Concurrency window**: Between `/api/calendar/slots` and `/api/calendar/book`, another visitor could grab the same slot. Mitigation: server re-checks `events.list` for the requested time range inside the book route before creating. If conflict, return 409. Client shows error toast.
- **Rate limiting**: Google Calendar API has quotas. For a portfolio, traffic is low — unlikely to hit. Document but no mitigation needed for v2.0.0.
- **GDPR-light**: Visitor email is captured in the calendar event as attendee + stored by Google. Add a 1-line privacy note near booking form ("Your email is shared with Google Calendar to send invites").
- **Existing /api/send route**: uses Nodemailer with `EMAIL_USER`/`EMAIL_PASSWORD`. We preserve and reuse for the contact form. Calendar booking uses Google's native invite emails — no extra Nodemailer call needed.
- **Hard-coded "to:" address**: `api/send/route.ts` line 26 has `to: "tomas.perez.developer@gmail.com"`. Move to env var `OWNER_EMAIL` for cleanness.
- **Form validation**: Current redesign Contact has no validation. Phase 7 adds: required name/email/message, basic email format check. Sonner toast on validation failure.
- **Email field missing in contact form**: redesign Contact form has Name + Subject + Message but NO email. Need to add an email field (otherwise we can't reply). The booking modal has its own form including email.
- **Loading states**: `/api/calendar/slots` fetch will take 200-800ms. CalendarWidget shows skeleton during load. After fetch, render the grid.
- **Reduced motion**: CalendarWidget should respect `prefers-reduced-motion` for any micro-animations (slot highlight on hover, modal open). Use CSS, not Framer.
- **Babel/SWC compatibility**: `googleapis` SDK is server-only. Make sure routes use `runtime: "nodejs"` if needed (default for app router routes).

</specifics>

<deferred>
## Deferred Ideas

- Voxel Rubik 5-state animation + click shuffle — Phase 8
- Framer Motion scroll animations — Phase 8
- Performance audit + bundle slim — Phase 9
- Multi-language calendar (es/en day names) — TODO consider in Phase 8 polish
- Phone field in booking — out of v2.0.0 scope
- Visitor-side timezone detection + display in their local time — nice-to-have, defer
- Webhook for booking notifications to Slack/Discord — out of scope
- Booking cancellation flow — visitors can use the Google Calendar invite to cancel directly; no in-app cancel UI in v2.0.0
- Admin dashboard to see bookings — Google Calendar IS the dashboard

</deferred>

---

*Phase: 07-contact-calendar*
*Context gathered: 2026-05-11 (manual)*
