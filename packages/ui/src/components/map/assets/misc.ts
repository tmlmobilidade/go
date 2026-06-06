/* * */

import { type MapAssetType } from './load';

/* * */

export const MAP_ASSETS_MISC = [
	{ name: 'map-misc-pin', sdf: false, url: '/global/map/misc/map-misc-pin.png' },
	{ name: 'map-misc-line-direction', sdf: true, url: '/global/map/misc/map-misc-line-direction.png' },
	{ name: 'map-misc-line-direction-offset', sdf: true, url: '/global/map/misc/map-misc-line-direction-offset.png' },
	{ name: 'map-misc-line-direction-offset-padding', sdf: true, url: '/global/map/misc/map-misc-line-direction-offset-padding.png' },
] as const satisfies MapAssetType[];

export type MapAssetMiscType = (typeof MAP_ASSETS_MISC)[number]['name'];
