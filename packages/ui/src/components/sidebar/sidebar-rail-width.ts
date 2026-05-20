/* * */

/** Keep in sync with `--sidebar-*` tokens in Sidebar/styles.module.css */
export const SIDEBAR_SCROLL_PADDING_PX = 5;

export const SIDEBAR_ICON_SIZE_PX = 20;

export const SIDEBAR_ITEM_SIZE_PX = 36;

export const SIDEBAR_LOGO_WIDTH_PX = 60;

export const SIDEBAR_COLLAPSED_WIDTH = Math.max(
	SIDEBAR_LOGO_WIDTH_PX,
	2 * SIDEBAR_SCROLL_PADDING_PX + SIDEBAR_ITEM_SIZE_PX,
);

export const SIDEBAR_RAIL_WIDTH_DEFAULT = 280;

export const SIDEBAR_RAIL_WIDTH_MIN = 200;

export const SIDEBAR_RAIL_WIDTH_MAX = 560;

/* * */

export function clampSidebarRailWidth(value: number): number {
	const n = Math.round(Number(value));
	if (Number.isNaN(n)) return SIDEBAR_RAIL_WIDTH_DEFAULT;
	return Math.min(SIDEBAR_RAIL_WIDTH_MAX, Math.max(SIDEBAR_RAIL_WIDTH_MIN, n));
}
