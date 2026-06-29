/* * */

import { type MapAssetType } from './load';

/* * */

export const MAP_ASSETS_VEHICLES = [
	{ name: 'map-vehicle-ccfl-bus', sdf: false, url: '/assets/map/vehicles/map-vehicle-ccfl-bus.png' },
	{ name: 'map-vehicle-cmet-bus', sdf: false, url: '/assets/map/vehicles/map-vehicle-cmet-bus.png' },
	{ name: 'map-vehicle-cp-train', sdf: false, url: '/assets/map/vehicles/map-vehicle-cp-train.png' },
	{ name: 'map-vehicle-fertagus-train', sdf: false, url: '/assets/map/vehicles/map-vehicle-fertagus-train.png' },
	{ name: 'map-vehicle-ml-train', sdf: false, url: '/assets/map/vehicles/map-vehicle-ml-train.png' },
	{ name: 'map-vehicle-mobi-bus', sdf: false, url: '/assets/map/vehicles/map-vehicle-mobi-bus.png' },
	{ name: 'map-vehicle-mts-tram', sdf: false, url: '/assets/map/vehicles/map-vehicle-mts-tram.png' },
	{ name: 'map-vehicle-tcb-bus', sdf: false, url: '/assets/map/vehicles/map-vehicle-tcb-bus.png' },
	{ name: 'map-vehicle-ttsl-boat', sdf: false, url: '/assets/map/vehicles/map-vehicle-ttsl-boat.png' },
] as const satisfies MapAssetType[];

export type MapAssetVehicleType = (typeof MAP_ASSETS_VEHICLES)[number]['name'];
