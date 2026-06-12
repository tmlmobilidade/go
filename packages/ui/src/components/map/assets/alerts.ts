/* * */

import { type MapAssetType } from './load';

/* * */

export const MAP_ASSETS_ALERTS = [
	{ name: 'map-alert-icon-accident', sdf: false, url: '/assets/map/alerts/map-alert-icon-accident.png' },
	{ name: 'map-alert-icon-barrier', sdf: false, url: '/assets/map/alerts/map-alert-icon-barrier.png' },
	{ name: 'map-alert-icon-calendar', sdf: false, url: '/assets/map/alerts/map-alert-icon-calendar.png' },
	{ name: 'map-alert-icon-emergency', sdf: false, url: '/assets/map/alerts/map-alert-icon-emergency.png' },
	{ name: 'map-alert-icon-info', sdf: false, url: '/assets/map/alerts/map-alert-icon-info.png' },
	{ name: 'map-alert-icon-megaphone', sdf: false, url: '/assets/map/alerts/map-alert-icon-megaphone.png' },
	{ name: 'map-alert-icon-storm', sdf: false, url: '/assets/map/alerts/map-alert-icon-storm.png' },
	{ name: 'map-alert-icon-tool', sdf: false, url: '/assets/map/alerts/map-alert-icon-tool.png' },
] as const satisfies MapAssetType[];

export type MapAssetAlertType = (typeof MAP_ASSETS_ALERTS)[number]['name'];
