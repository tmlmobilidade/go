import { isValidCoordinatePair } from '@tmlmobilidade/geo';

/* * */

/** Delay (ms) before moving the search pin after editing coordinate fields. */
export const COORDINATES_PIN_DEBOUNCE_MS = 400;

function toFiniteLngLat(latitude: unknown, longitude: unknown): null | { latitude: number, longitude: number } {
	const latitudeN = typeof latitude === 'number' ? latitude : Number(latitude);
	const longitudeN = typeof longitude === 'number' ? longitude : Number(longitude);
	if (!Number.isFinite(latitudeN) || !Number.isFinite(longitudeN)) return null;
	return { latitude: latitudeN, longitude: longitudeN };
}

/** Formats a pair for map search-pin context; '' if values are unusable / outside Portugal. */
export function coordinatesToSearchQuery(latitude: unknown, longitude: unknown): string {
	const coords = toFiniteLngLat(latitude, longitude);
	if (!coords || !isValidCoordinatePair(coords.latitude, coords.longitude)) return '';
	return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
}
