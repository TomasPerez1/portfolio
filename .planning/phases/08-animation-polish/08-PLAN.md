# Phase 8 Plan: Animation & Polish

**Phase:** 8 of 9
**Complexity:** L
**Requirements:** QR-03 (reduced-motion), D-05, D-06
**Depends on:** Phase 7 (implementation complete; user setup pending but unrelated to Phase 8)
**Status:** Ready to execute

---

## Goal

Hero voxel becomes interactive (5 distinct cube states, click cycles with scatter/reform shuffle), all content sections animate into view on scroll, reduced-motion respected throughout. Optional ≤2 react-bits picks deferred to user.

---

## Pre-Flight Checks

- [ ] On branch `v2.0.0` with Phase 7 commits merged (HEAD ≥ `85509b4`)
- [ ] `npx tsc --noEmit` passes baseline
- [ ] `npm run build` passes baseline
- [ ] `framer-motion` 12.x installed (verify in `package.json`)
- [ ] No uncommitted local changes

---

## Tasks (sequential)

### Task 1 — Define 5 voxel states

**File:** `my-app/src/app/components/voxel-states.ts` (NEW)

**Actions:**
1. Create file exporting `VoxelState` interface + `VOXEL_STATES: readonly VoxelState[]` (5 entries)
2. State 0 = current default (preserve exactly: 12 yellow voxels + 11 removed at the specific coords from current Hero)
3. States 1-4 = 4 NEW distinct silhouettes. Each uses a 4×4×4 grid. Each has 8-14 yellow accent voxels + 6-12 removed shell voxels. Visual variety: vertical bar, diagonal sweep, ring/hollow, asymmetric tower.
4. Verify each state produces a structurally interesting shell (not all yellow, not all removed)
5. `npx tsc --noEmit` passes

**Acceptance:**
- File exports 5 typed states
- Each state has yellow + removed Sets of strings
- Build passes

**Commit:** `feat(phase-8): define 5 voxel state configurations`

---

### Task 2 — Refactor Hero voxel rendering to consume state-from-store

**File:** `my-app/src/app/components/Hero.tsx`

**Actions:**
1. Import `VOXEL_STATES`
2. Replace the hardcoded `yellow`/`removed` Sets inside `VoxelArt()` with the active state's Sets — pass state index as a prop OR via context. Simplest: pass `stateIndex` as a prop from HeroSection.
3. HeroSection now manages `useState<number>(0)` for `voxelState`, plus `useState<boolean>(false)` for `shuffling`
4. The existing voxel generation loop now reads from `VOXEL_STATES[stateIndex]` and emits the appropriate `voxels` array
5. Voxels render — for now WITHOUT animation between states (we add framer in Task 3). Just confirm clicking cycles through 5 visual configs.
6. Add click handler on the `wrapRef` div: `if (!shuffling) setVoxelState((i) => (i+1) % VOXEL_STATES.length)`
7. Add keyboard handler (Enter/Space) + `role="button"` + `tabIndex={0}` + `aria-label="Shuffle voxel cube"`
8. Update the visual hint text from "Voxel · drag to rotate" → "Voxel · click to shuffle"
9. Cursor on the wrap div: `cursor-pointer`
10. Brief 100ms scale-down on click (visual feedback): wrap voxel in a div with `data-clicking` attribute and CSS transition (or use framer's `whileTap`)
11. `npx tsc --noEmit` + `npm run build` pass

**Acceptance:**
- Clicking the voxel cycles through 5 states (instant swap, no animation yet — that's Task 3)
- Keyboard activates shuffle
- Hint text updated
- Build passes

**Commit:** `feat(phase-8): wire voxel state cycling on click with 5 states`

---

### Task 3 — Add Framer Motion shuffle animation to voxel

**File:** `my-app/src/app/components/Hero.tsx`

**Actions:**
1. Import `motion`, `AnimatePresence`, `useReducedMotion` from `framer-motion`
2. Wrap each `<Voxel />` in `<motion.div>` with:
   - `layout` prop (auto-animates position changes)
   - `initial={{ opacity: 0, scale: 0.6 }}`
   - `animate={{ opacity: 1, scale: 1 }}`
   - `exit={{ opacity: 0, scale: 0.6 }}`
   - `transition={{ duration: 0.5, ease: [.2,.8,.2,1] }}`
3. Wrap the voxel list with `<AnimatePresence mode="popLayout">`
4. On state change, framer auto-animates:
   - Voxels with stable key animate to new position (`layout`)
   - Voxels that don't exist in new state: exit (`AnimatePresence`)
   - Voxels new to the state: enter (`initial → animate`)
5. Set `shuffling = true` on click, `shuffling = false` after 600ms (animation duration + safety buffer)
6. If `useReducedMotion()` returns true: replace all framer animations with instant (`transition={{ duration: 0 }}`)
7. Pause the autoplay `mousemove` handler during shuffle (existing `autoOn` flag)
8. `npx tsc --noEmit` + `npm run build` pass

**Acceptance:**
- Click cube → visible scatter/reform animation lasting ~600ms
- States cycle smoothly
- Reduced-motion: instant swap
- No FPS drops on dev machine

**Commit:** `feat(phase-8): animate voxel shuffle with framer-motion layout transitions`

---

### Task 4 — Add scroll-triggered entrance to all content sections

**Files (8):**
- `Hero.tsx` (on-mount entrance, not scroll)
- `FeaturedWork.tsx` (scroll + stagger 3 cards)
- `ProjectsGrid.tsx` (scroll + stagger 6 cards)
- `StackSection.tsx` (scroll + stagger categories)
- `Experience.tsx` (scroll + stagger entries)
- `About.tsx` (scroll, single fade)
- `Contact.tsx` (scroll, single fade)
- `Footer.tsx` (scroll, single fade)

**Actions:**
1. For each section: wrap the outer `<section>` (or `<footer>`) with `<motion.section>` (or `<motion.footer>`)
2. Add props:
   ```ts
   initial={{ opacity: 0, y: 32 }}
   whileInView={{ opacity: 1, y: 0 }}
   viewport={{ once: true, amount: 0.25 }}
   transition={{ duration: 0.6, ease: [.2,.8,.2,1] }}
   ```
3. For sections with lists (FeaturedWork, ProjectsGrid, StackSection, Experience): wrap the children container with `<motion.div>` + `variants={{ container: { ... } }}` + `transition={{ staggerChildren: 0.08 }}`. Wrap each child with `<motion.div variants={{ initial, animate }}>`.
4. Hero entrance: use `initial`/`animate` (not `whileInView`) since Hero is above the fold on first paint. Stagger eyebrow → h1 → tagline → CTAs over 0.4s starting at 0.1s.
5. Use `useReducedMotion()` in each section: if true, pass `initial` and `animate` both as final state (no transition).
6. `npx tsc --noEmit` + `npm run build` pass

**Acceptance:**
- Scroll down on `/en` — every section fades in from below as it enters viewport
- FeaturedWork: 3 cards stagger 0.08s apart
- ProjectsGrid: 6 cards stagger
- StackSection: categories stagger
- Experience: rows stagger
- Hero: on-mount staggered entrance
- Reduced-motion: all sections render at final state instantly

**Commit:** `feat(phase-8): add scroll-triggered entrance animations to all content sections`

---

### Task 5 — react-bits selection gate (user decision)

**Actions:**
1. Pause and ask the user which (if any) 2 react-bits components to incorporate (D-06 cap)
2. Candidates documented for user reference:
   - **TextRevealByWord / SplitText** — Hero `h1` "Tomás Pérez" title word-by-word reveal
   - **Magnetic / SpotlightCard** — FeaturedCard hover effect (cursor-following spotlight)
   - **Shimmer / ShineBorder** — apply to the "Send message" / "Confirm booking" CTAs
   - **Tilt** — already have voxel; possibly nav logo
3. If user picks ≤2, plan integration in a follow-up task (8.5 perhaps)
4. If user skips, mark Task 5 as N/A and proceed to Task 6

**Acceptance:**
- User has chosen 0, 1, or 2 react-bits components
- Decision documented in build report

**Commit (if integrated):** `feat(phase-8): integrate selected react-bits component(s)`

---

### Task 6 — Manual smoke test

**Verifications:**
1. `npm run dev` → `/en`
2. Hero voxel renders as state 0 (current default)
3. Click voxel → visible shuffle animation (~600ms) → lands on state 1
4. Click 4 more times → cycles through states 2, 3, 4, then back to 0
5. Click while shuffle in progress → no double-trigger (locked by `shuffling` flag)
6. Tab keyboard to voxel → focus ring visible → Enter triggers shuffle
7. Scroll down → each section fades in from below as it enters viewport
8. Lists (FeaturedWork, ProjectsGrid, StackSection, Experience): children stagger visibly
9. Scroll back up → sections stay rendered (no re-animation; `once: true`)
10. DevTools → Rendering → enable `prefers-reduced-motion: reduce` → reload:
    - Voxel: click swaps state INSTANTLY (no animation)
    - Sections: render at final state on load (no scroll animation)
11. Mobile viewport (375px) → animations still feel smooth, no FPS drops
12. Switch theme → animations still respect data-theme (don't break colors)
13. Switch lang → all animations replay on the new content load

**No commit yet.** Record observations for build report.

**Acceptance:**
- All 13 checks pass

---

### Task 7 — Build report + STATE.md

**Actions:**
1. Create `.planning/phases/08-animation-polish/08-BUILD-REPORT.md`:
   - Files added/modified
   - tsc + build status
   - Smoke test results (13 checks)
   - Deviations
   - react-bits decision recorded (which 2, or none)
   - Deferred items (theme transition smoothness, locale change animation)
2. Update `.planning/STATE.md` to Phase 8 done, Phase 9 next
3. Commit: `docs(phase-8): finalize build report and state`

**Acceptance:**
- Build report + STATE updated
- All ROADMAP success criteria documented as met

---

## Commit Plan (atomic)

| # | Files | Message |
|---|-------|---------|
| 1 | `voxel-states.ts` | `feat(phase-8): define 5 voxel state configurations` |
| 2 | `Hero.tsx` | `feat(phase-8): wire voxel state cycling on click with 5 states` |
| 3 | `Hero.tsx` | `feat(phase-8): animate voxel shuffle with framer-motion layout transitions` |
| 4 | 8 section files | `feat(phase-8): add scroll-triggered entrance animations to all content sections` |
| 5 | (optional, depends on user pick) | `feat(phase-8): integrate selected react-bits component(s)` |
| 6 | (smoke test, no commit) | — |
| 7 | `08-BUILD-REPORT.md`, `STATE.md` | `docs(phase-8): finalize build report and state` |

---

## Success Criteria (from ROADMAP)

1. ✅ Framer Motion scroll layer applied across all content sections
2. ✅ Site "feels alive without being noisy"
3. ✅ react-bits cap of ≤2 components respected
4. ✅ Reduced-motion preference fully respected (no animations when set)
5. ✅ Performance acceptable (no perceptible FPS drops)

**Custom criteria (voxel Rubik addition):**
6. ✅ Voxel cycles through 5 distinct visual states on click
7. ✅ Shuffle animation is smooth (~600ms) and visually distinct
8. ✅ Keyboard accessible

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Framer Motion `AnimatePresence` + RAF tilt fight for control | Medium | They're on different layers — RAF updates parent rotateX/rotateY transform; framer animates child translate3d via layout. Test in Task 3. |
| Mobile GPU overload during scatter/reform | Low-Medium | ~20 voxels animating simultaneously is well within budget; modern phones handle 1000s of transformed elements. |
| Stagger feels too slow on long viewport | Low | 0.08s per child = 0.48s for 6 items. Adjustable. |
| `whileInView` retriggers on scroll-up | Low | `once: true` prevents re-trigger. |
| Voxel click conflicts with mouse-tilt | Low | Click is a separate event; mouse-tilt is mousemove. Click + immediate tilt update is fine. |
| Reduced-motion users see broken layout | Low | Sections still render at final state; reduced-motion only disables transitions, not visibility. |
| Stagger children visible "popping" on slow connections | Low | Animation only runs after viewport intersection, which happens after layout settles. |

---

## Goal-Backward Verification

**Goal:** Site feels alive. Voxel is delightful. Scroll animations frame the content without distracting.

Working backward:
- Phase 9 needs a polished site to audit → Task 4 ships the polish ✓
- D-06 (≤2 react-bits) → Task 5 either picks 2 OR documents skip ✓
- QR-03 (reduced motion) → Tasks 3, 4 implement it ✓
- D-05 (framer-motion) → Tasks 3, 4 use it ✓
- Voxel is the centerpiece of the Hero → Tasks 1-3 deliver it ✓

---

## Out of Scope (explicitly)

- Animated theme transition (smooth color crossfade) — Phase 9 polish
- Animated locale change — Phase 9 polish
- Voxel face-rotation Rubik-style (true face rotation) — future enhancement
- Sounds, particles — out of scope
- Calendar widget animations — locked at Phase 7

---

*Plan written: 2026-05-11 — manual GSD format*
