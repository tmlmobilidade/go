/* * */

import { type MapAssetType } from './load';

/* * */

export const MAP_ASSETS_ALERT_ICONS = [
	{ name: 'map-alert-icon-accident', sdf: false, url: '/global/map/alert-icons/map-alert-icon-accident.png' },
	{ name: 'map-alert-icon-barrier', sdf: false, url: '/global/map/alert-icons/map-alert-icon-barrier.png' },
	{ name: 'map-alert-icon-calendar', sdf: false, url: '/global/map/alert-icons/map-alert-icon-calendar.png' },
	{ name: 'map-alert-icon-emergency', sdf: false, url: '/global/map/alert-icons/map-alert-icon-emergency.png' },
	{ name: 'map-alert-icon-info', sdf: false, url: '/global/map/alert-icons/map-alert-icon-info.png' },
	{ name: 'map-alert-icon-megaphone', sdf: false, url: '/global/map/alert-icons/map-alert-icon-megaphone.png' },
	{ name: 'map-alert-icon-storm', sdf: false, url: '/global/map/alert-icons/map-alert-icon-storm.png' },
	{ name: 'map-alert-icon-tool', sdf: false, url: '/global/map/alert-icons/map-alert-icon-tool.png' },
] as const satisfies MapAssetType[];

export type MapAssetAlertIconType = (typeof MAP_ASSETS_ALERT_ICONS)[number]['name'];
