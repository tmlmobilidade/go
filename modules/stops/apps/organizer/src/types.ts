/* * */

import { type District, Locality, Municipality, ParishDocument } from '@tmlmobilidade/go-types';

/**
 * Represents a response from the Locations API.
 */
export interface LocationsApiResponse {
	district: null | Omit<District, 'geojson'>
	latitude: number
	locality: null | Omit<Locality, 'geojson'>
	longitude: number
	municipality: null | Omit<Municipality, 'geojson'>
	parish: null | Omit<ParishDocument, 'geojson'>
}
