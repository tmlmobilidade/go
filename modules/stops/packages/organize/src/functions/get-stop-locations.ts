/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type District, type Locality, type Municipality, type ParishFeature } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';

/* * */

export interface LocationsApiResponse {
	district: null | Omit<District, 'geojson'>
	latitude: number
	locality: null | Omit<Locality, 'geojson'>
	longitude: number
	municipality: null | Omit<Municipality, 'geojson'>
	parish: null | Omit<ParishFeature, 'geojson'>
}

interface GetStopLocationsResponse {
	district_id: null | string
	locality_id: null | string
	municipality_id: null | string
	parish_id: null | string
}

/**
 * Adds location IDs to a Stop object based on its coordinates.
 * @param stopData The Stop object to update.
 * @returns The updated Stop object with location IDs.
 */
export async function getStopLocations(lat: number, lon: number): Promise<GetStopLocationsResponse> {
	//

	const result = {
		district_id: null,
		locality_id: null,
		municipality_id: null,
		parish_id: null,
	};

	if (!lat || !lon) return result;

	//
	// Fetch the relevant Location data for this coordinate pair

	const locationsApiUrl = `${API_ROUTES.locations.LOCATIONS_COORDINATES}?lat=${lat}&lon=${lon}`;

	const { data: locationsData } = await fetchData<LocationsApiResponse>(locationsApiUrl);

	if (!locationsData) {
		console.log({ message: `No locations data found for coordinates ${lat}, ${lon}.` });
		return result;
	}

	result.district_id = locationsData.district?._id ?? null;
	result.locality_id = locationsData.locality?._id ?? null;
	result.municipality_id = locationsData.municipality?._id ?? null;
	result.parish_id = locationsData.parish?._id ?? null;

	return result;

	//
}
