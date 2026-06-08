/* * */

import { type MapAssetType } from './load';

/* * */

export const MAP_ASSETS_STOPS = [
	{ name: 'map-navegante-stop-bus-idle', sdf: false, url: '/assets/map/stops/map-navegante-stop-bus-idle.png' },
	{ name: 'map-navegante-stop-bus-selected', sdf: false, url: '/assets/map/stops/map-navegante-stop-bus-selected.png' },
] as const satisfies MapAssetType[];

export type MapAssetStopType = (typeof MAP_ASSETS_STOPS)[number]['name'];
