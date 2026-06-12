/* * */

import { type MapAssetType } from './load';

/* * */

export const MAP_ASSETS_SHAPES = [
	{ name: 'map-shape-arrow-inline', sdf: true, url: '/assets/map/shapes/map-shape-arrow-inline.png' },
	{ name: 'map-shape-arrow-offset', sdf: true, url: '/assets/map/shapes/map-shape-arrow-offset.png' },
	{ name: 'map-shape-arrow-offset-padding', sdf: true, url: '/assets/map/shapes/map-shape-arrow-offset-padding.png' },
] as const satisfies MapAssetType[];

export type MapAssetShapeType = (typeof MAP_ASSETS_SHAPES)[number]['name'];
