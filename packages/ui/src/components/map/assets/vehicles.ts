/* * */

import { type MapAssetType } from './load';

/* * */

export const MAP_ASSETS_VEHICLES = [
	{ name: 'map-vehicle-ccfl-default-light', sdf: false, url: '/global/map/vehicles/map-vehicle-ccfl-default-light.png' },
	{ name: 'map-vehicle-cmet-default-light', sdf: false, url: '/global/map/vehicles/map-vehicle-cmet-default-light.png' },
	{ name: 'map-vehicle-cp-default-light', sdf: false, url: '/global/map/vehicles/map-vehicle-cp-default-light.png' },
	{ name: 'map-vehicle-fertagus-default-light', sdf: false, url: '/global/map/vehicles/map-vehicle-fertagus-default-light.png' },
	{ name: 'map-vehicle-mobi-default-light', sdf: false, url: '/global/map/vehicles/map-vehicle-mobi-default-light.png' },
	{ name: 'map-vehicle-mts-default-light', sdf: false, url: '/global/map/vehicles/map-vehicle-mts-default-light.png' },
	{ name: 'map-vehicle-tcb-default-light', sdf: false, url: '/global/map/vehicles/map-vehicle-tcb-default-light.png' },
	{ name: 'map-vehicle-ttsl-default-light', sdf: false, url: '/global/map/vehicles/map-vehicle-ttsl-default-light.png' },
] as const satisfies MapAssetType[];

export type MapAssetVehicleType = (typeof MAP_ASSETS_VEHICLES)[number]['name'];
