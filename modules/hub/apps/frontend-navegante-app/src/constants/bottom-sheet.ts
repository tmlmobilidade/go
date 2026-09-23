export const ACTIVE_MAP_BOTTOM_SHEET_HEIGHT_CSS_PROPERTY = '--active-map-bottom-sheet-height';
export const MAP_BOTTOM_SHEET_INITIAL_SNAP = 1;
// react-modal-sheet requires 1 as the terminal snap. The container itself is capped at
// 95dvh, so this opens the sheet fully without covering the complete viewport.
export const MAP_BOTTOM_SHEET_SNAP_POINTS = [0, 0.28, 0.64, 1];
