/* * */

import { type District, Locality, Municipality, ParishFeature } from '@tmlmobilidade/types';

/**
 * Represents a response from the Locations API.
 */
export interface LocationsApiResponse {
	district: null | Omit<District, 'geojson'>
	latitude: number
	locality: null | Omit<Locality, 'geojson'>
	longitude: number
	municipality: null | Omit<Municipality, 'geojson'>
	parish: null | Omit<ParishFeature, 'geojson'>
}
