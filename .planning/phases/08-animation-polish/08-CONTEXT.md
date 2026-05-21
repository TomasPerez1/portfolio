# Phase 8: Animation & Polish

**Gathered:** 2026-05-11
**Status:** Ready for planning
**Source:** Manual draft (gsd-sdk unavailable)

<domain>
## Phase Boundary

Add personality and motion to the v2 site: (1) the voxel Hero becomes interactive — 5 distinct cube state configurations, clicking the cube triggers a Rubik-style shuffle animation that lands on the next state; (2) Framer Motion drives scroll-triggered entrance animations on all content sections; (3) optional surgical use of up to 2 react-bits components per D-06. All animations respect `prefers-reduced-motion`.

**In scope:**
- Define 5 voxel state configurations (`yellow` + `removed` Sets per state)
- Add interaction: click on voxel container → shuffle animation → land on next state
- Shuffle visual: voxels scatter outward, swap state mid-animation, voxels converge on new positions (~1.0-1.4s total)
- Cycle through 5 states (round-robin or random-non-repeating)
- Auto-rotation continues between shuffles (existing 30fps throttle preserved)
- Framer Motion scroll-triggered fade-in/slide-up for every content section (StackTicker, FeaturedWork, ProjectsGrid, StackSection, Experience, About, Contact, Footer)
- Stagger children where appropriate (FeaturedCard, GridProject, ExperienceEntry rows)
- Hero entrance: gentle stagger on title/tagline/CTAs on first paint (not scroll-driven — Hero is above the fold)
- Reduced-motion path: shuffle = instant state swap, scroll animations = static (no transform/opacity transition)
- Verify performance — no FPS drops on mobile mid-range

**Optional (D-06 allows ≤2 react-bits):**
- Decide WHICH 2 react-bits components to use, IF any. Candidates documented but not committed in plan. User picks at execution.

**Out of scope:**
- Calendar widget polish (locked in Phase 7)
- New content (every section's data already wired)
- Bundle / Lighthouse / Vercel deploy — Phase 9
- New page transitions (single-page site)
- Loading skeletons beyond current LangLoader
- Voxel mouse-drag manual rotation beyond current behavior (auto-tilt + click-to-shuffle, no drag)

</domain>

<decisions>
## Implementation Decisions

### Locked from PROJECT.md / ROADMAP
- **D-05**: Framer Motion stays as the animation engine — install version already present
- **D-06**: react-bits hard-cap at 2 components; surgical placement only

### Phase-8 specific (Claude's discretion — confirm before execute)
- **Voxel shuffle approach**: "Scatter & reform" pattern — voxels animate outward (random direction × distance) for ~500ms, state swaps internally, voxels animate inward to new positions over ~500ms. Total ~1.0-1.2s. Cleaner than a face-rotation Rubik implementation (which would require tracking face-membership through multiple 90° rotations — complex). Visually still reads as "the cube reshuffled itself".
- **Voxel state cycling**: round-robin through the 5 states. Each click goes to the next state. On the 6th click, back to state 0. Deterministic and predictable. (Random would feel less satisfying because user couldn't intuitively know it'd reach all 5.)
- **5 state designs**: 4 are NEW — distinct visual patterns (different yellow accents + voxel removal silhouettes). State 0 = the current default (preserve as-is). Each new state takes ~20 voxels (similar density to current).
- **Framer Motion integration for voxel**: keep the current `requestAnimationFrame`-driven `tilt` state. ADD a separate `motion.div` wrapper PER VOXEL with `animate` driven by the state position + `transition` config. Use `AnimatePresence` for voxels that appear/disappear between states. This composes with the existing rAF tilt — they're on different transform axes.
- **Scroll animation pattern**: `<motion.section initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.6, ease: [.2,.8,.2,1] }}>`. Apply at the SECTION level (one wrap per section). Children inherit via the natural document flow; stagger only where there's a list (FeaturedCard, GridProject).
- **Stagger pattern**: For lists with > 3 items (ProjectsGrid 6, Experience 6), wrap the container with `transition={{ staggerChildren: 0.1 }}` and each item with `initial`/`whileInView` of its own. For shorter lists (FeaturedWork 3, StackSection categories), single fade-in suffices.
- **Reduced-motion path**:
  - Voxel: shuffle becomes instant state swap (still cycles, just no animation)
  - Sections: skip `initial`/`animate` — render at final state. Implement via `useReducedMotion()` hook from framer-motion and conditionally pass undefined to animation props.
- **Click target on voxel**: the existing `wrapRef` div (the aspect-square container). Cursor changes to pointer on hover. Click fires `onShuffle()` callback. Disable during an active shuffle (prevent rapid-fire).
- **Performance budget**: shuffle runs at full framerate (RAF on demand for ~1.2s). Scroll-triggered animations also full framerate. The continuous 30fps throttle from Phase 5 only applies to the autoplay tilt — independent.
- **react-bits selection**: DEFER — list candidates in plan; user picks when ready. If user skips both, Phase 8 still ships without them (≤2 is a cap, not a minimum).

### Claude's Discretion
- Whether to add a subtle UI hint (e.g. "click to shuffle" text) near the voxel — YES, replace the existing "Voxel · drag to rotate" hint with "Voxel · click to shuffle"
- Whether to add haptic-style visual feedback on click (subtle flash, slight scale) — YES, brief 100ms scale-down on click for tactile feel
- Whether scroll animations also animate the Nav pill state changes — NO, Nav already has its own scroll detection (Phase 5); don't double-animate

</decisions>

<canonical_refs>
## Canonical References

### Project specs
- `.planning/PROJECT.md` — D-05, D-06
- `.planning/REQUIREMENTS.md` — QR-03 (reduced-motion)
- `.planning/ROADMAP.md` — Phase 8 goal

### Existing infrastructure (consumed)
- `framer-motion` ^12.x already installed (D-05)
- `useReducedMotion` hook from `framer-motion`
- `.css` `prefers-reduced-motion` rules in globals.css (Phase 6 added animation: none for tickers)

### Files to modify
1. `my-app/src/app/components/Hero.tsx` — refactor voxel internals to support 5 states + shuffle animation + click handler
2. `my-app/src/app/components/About.tsx` — wrap section in `motion.section` (scroll-fade entrance)
3. `my-app/src/app/components/Contact.tsx` — same scroll-fade
4. `my-app/src/app/components/Experience.tsx` — scroll-fade + stagger entries
5. `my-app/src/app/components/FeaturedWork.tsx` — scroll-fade + stagger 3 cards
6. `my-app/src/app/components/Footer.tsx` — scroll-fade
7. `my-app/src/app/components/ProjectsGrid.tsx` — scroll-fade + stagger 6 cards
8. `my-app/src/app/components/StackSection.tsx` — scroll-fade + stagger categories

### Files to create
1. `my-app/src/app/components/voxel-states.ts` — exports `VOXEL_STATES: VoxelState[]` (5 entries)

### Files NOT touched
- `Nav.tsx` (its own scroll behavior; no entrance animation needed)
- `LangSwitch.tsx`, `BookingModal.tsx`, `CalendarWidget.tsx` (UI primitives — no scroll context)
- `globals.css` (no new utility classes needed; framer handles inline styles)

</canonical_refs>

<specifics>
## Specific Risks & Notes

- **Voxel state stored in React state**: `useState<number>(0)` for current state index. Click → setCurrentState((i) => (i+1) % 5). Triggers re-render → framer animates voxel positions.
- **Voxels appear/disappear between states**: A voxel at position `[1,2,1]` in state 0 might not exist in state 1. Use `AnimatePresence` with `mode="popLayout"` to handle enter/exit. Exit = fade-out + scale-down. Enter = fade-in + scale-up.
- **Voxel `key` prop**: each voxel needs a stable key for AnimatePresence to track. Use `${x},${y},${z}` (already the pattern). Important: same key across states = framer animates between positions; different key = exit + enter.
- **Hover interference**: the existing `mousemove` listener updates `tilt`. During shuffle (1.2s), `mousemove` shouldn't keep updating tilt. Add a `shuffling` flag that pauses mousemove handling.
- **`autoOn` interaction**: the existing autoplay sets `autoOn = false` on mousemove. Click + shuffle should NOT permanently set `autoOn = false` — re-enable after shuffle completes.
- **rAF + framer interaction**: framer uses its own animation loop. They coexist. Concern: massive simultaneous transforms might tax mobile GPUs. Mitigation: limit voxel count per state to ~20-25 (current is 21). Test on mobile.
- **Initial paint flash**: Hero is above the fold. Scroll animations on Hero would flash empty content. Solution: Hero entrance animates ON MOUNT (not scroll), and the Voxel renders at state[0] immediately (no entrance for voxel itself — it's the cube, it's there).
- **Stagger compounding**: If multiple sections fade in simultaneously (long viewport visible on first paint), staggers might overlap. Each section is independent — fine. `once: true` means each section animates exactly once.
- **`useReducedMotion()` value**: framer's hook returns `boolean | null`. Treat null as false (assume motion allowed until OS preference is known).
- **Voxel hint copy**: replacing "Voxel · drag to rotate" with "Voxel · click to shuffle" — the current text is wrong anyway (it's not drag, it's mouse tilt). Hint text could be localized later (Phase 9 polish) but for now stays in English.
- **Click target a11y**: the voxel wrap div needs `role="button"` + `tabIndex={0}` + `onKeyDown` for Enter/Space → shuffle. Otherwise keyboard users can't trigger shuffle.

</specifics>

<deferred>
## Deferred Ideas

- react-bits picks — user-discretionary; deferred until user names the 2 components they want
- Animated theme transition (smooth color crossfade when toggling dark/light) — Phase 9 polish
- Animated locale change (smooth content swap on lang toggle) — Phase 9 polish
- Voxel face-rotation (true Rubik-style rotation rather than scatter/reform) — possible v2.1 enhancement
- Adding sounds (click feedback, shuffle sound) — out of scope
- Particle effects during shuffle — out of scope
- Voxel drag-to-rotate (manual cube rotation via mouse drag) — out of scope; auto-tilt + click-to-shuffle is the interaction model

</deferred>

---

*Phase: 08-animation-polish*
*Context gathered: 2026-05-11 (manual)*
