/**
 * Voxel cube state configurations.
 * Each state defines:
 *   - yellow: voxels rendered in yellow accent color
 *   - removed: voxels excluded from the shell
 * Coordinates are "x,y,z" strings within a 4×4×4 grid (0-3 on each axis).
 *
 * Click cycles through states 0 → 1 → 2 → 3 → 4 → 0 (round-robin).
 * State 0 is the canonical default — preserved from the original design.
 */

export interface VoxelState {
  yellow: ReadonlySet<string>;
  removed: ReadonlySet<string>;
}

const set = (...coords: string[]): ReadonlySet<string> => new Set<string>(coords);

// State 0 — default (preserved from original design)
const STATE_0: VoxelState = {
  yellow: set("1,3,1", "2,3,1", "3,3,1", "2,2,1", "2,1,1", "2,0,1", "1,3,2", "2,3,2", "3,3,2", "2,2,2", "2,1,2", "2,0,2"),
  removed: set("0,0,0", "0,1,0", "0,2,3", "3,0,3", "3,3,0", "0,3,3", "3,2,0", "1,0,3", "2,3,3", "0,2,0", "3,1,3"),
};

// State 1 — vertical accent bar with chamfered corners
const STATE_1: VoxelState = {
  yellow: set("1,0,1", "1,1,1", "1,2,1", "1,3,1", "2,0,1", "2,1,1", "2,2,1", "2,3,1", "1,0,2", "2,0,2", "1,3,2", "2,3,2"),
  removed: set("0,0,0", "3,0,0", "0,3,0", "3,3,0", "0,0,3", "3,0,3", "0,3,3", "3,3,3", "0,1,0", "0,2,0"),
};

// State 2 — diagonal sweep across the front face
const STATE_2: VoxelState = {
  yellow: set("0,0,1", "1,1,1", "2,2,1", "3,3,1", "0,1,1", "1,2,1", "2,3,1", "1,0,1", "2,1,1", "3,2,1"),
  removed: set("0,0,3", "0,3,0", "0,3,3", "3,0,0", "3,0,3", "3,3,3", "1,0,3", "2,0,3", "0,1,3", "0,2,3"),
};

// State 3 — carved happy face: features removed from front shell, yellow core
// exposed through the holes; asymmetric corner chips and top accent stripe
const STATE_SMILEY: VoxelState = {
  yellow: set(
    // exposed core behind the carved eyes
    "0,2,2", "3,2,2",
    // exposed core behind the carved smile
    "0,1,2", "3,1,2", "1,0,2", "2,0,2",
    // top edge accent stripe
    "1,3,3", "2,3,3",
  ),
  removed: set(
    // eyes carved into the front face
    "0,2,3", "3,2,3",
    // smile carved into the front face
    "0,1,3", "3,1,3", "1,0,3", "2,0,3",
    // asymmetric corner chips for irregular silhouette
    "0,3,3", "3,3,0",
  ),
};

// State 4 — hollow ring around the equator
const STATE_3: VoxelState = {
  yellow: set("0,1,0", "0,2,0", "0,1,3", "0,2,3", "3,1,0", "3,2,0", "3,1,3", "3,2,3", "1,1,3", "2,1,3", "1,2,3", "2,2,3"),
  removed: set("1,1,1", "2,1,1", "1,2,1", "2,2,1", "1,1,2", "2,1,2", "1,2,2", "2,2,2"),
};

// State 5 — asymmetric tower with cap
const STATE_4: VoxelState = {
  yellow: set("0,3,0", "1,3,0", "2,3,0", "3,3,0", "0,3,1", "1,3,1", "2,3,1", "3,3,1", "1,2,0", "2,2,0", "1,1,0", "2,0,0"),
  removed: set("0,0,3", "1,0,3", "2,0,3", "3,0,3", "0,1,3", "3,1,3", "0,2,3", "3,2,3", "1,3,3", "2,3,3"),
};

export const VOXEL_STATES: readonly VoxelState[] = [STATE_0, STATE_1, STATE_2, STATE_SMILEY, STATE_3, STATE_4];
