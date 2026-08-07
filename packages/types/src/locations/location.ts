/* * */

import { District } from './district.js';
import { Locality } from './locality.js';
import { Municipality } from './municipality.js';
import { Parish } from './parish.js';

/**
 * This type represents the aggregated location information,
 * combining various geographic entities into a single structure.
 */
export interface Location {
	district: District | null
	latitude: number
	locality: Locality | null
	longitude: number
	municipality: Municipality | null
	parish: null | Parish
}
