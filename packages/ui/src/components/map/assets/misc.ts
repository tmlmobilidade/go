/* * */

import { type MapAssetType } from './load';

/* * */

export const MAP_ASSETS_MISC = [
	{ name: 'map-misc-pin', sdf: false, url: '/assets/map/misc/map-misc-pin.png' },
] as const satisfies MapAssetType[];

export type MapAssetMiscType = (typeof MAP_ASSETS_MISC)[number]['name'];
