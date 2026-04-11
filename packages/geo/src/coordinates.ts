/* * */

/**
 * Checks if the given latitude value is valid given Portugal limits.
 * @param value The latitude value to check.
 * @returns The clamped latitude value if valid, false otherwise.
 */
export function isValidLatitude(value: number): false | number {
	const hasValue = value !== undefined && value !== null;
	const isWithinPortugal = value >= 36.9 && value <= 42.0;
	if (!hasValue || !isWithinPortugal) return false;
	return clampCoordinate(value);
}

/**
 * Checks if the given longitude value is valid given Portugal limits.
 * @param value The longitude value to check.
 * @returns The clamped longitude value if valid, false otherwise.
 */
export function isValidLongitude(value: number): false | number {
	const hasValue = value !== undefined && value !== null;
	const isWithinPortugal = value >= -9.5 && value <= -6.0;
	if (!hasValue || !isWithinPortugal) return false;
	return clampCoordinate(value);
}

/**
 * Checks if the given latitude and longitude values form a valid coordinate pair.
 * @param lat The latitude value to check.
 * @param lng The longitude value to check.
 * @returns True if the coordinate pair is valid, false otherwise.
 */
export function isValidCoordinatePair(lat: number, lng: number): boolean {
	const isValidLat = isValidLatitude(lat);
	const isValidLng = isValidLongitude(lng);
	return !!isValidLat && !!isValidLng;
}

/**
 * Clamps a coordinate value to 6 decimal places
 * and ensures it's a valid number.
 * @param value The coordinate value to clamp.
 * @returns The clamped coordinate value, or null if the input value is invalid.
 */
export function clampCoordinate(value: null | number | string | undefined): null | number {
	if (value == null) return null;
	const num = typeof value === 'string' ? parseFloat(value) : value;
	if (isNaN(num)) return null;
	return parseFloat(num.toFixed(6));
}

/**
 * Parses a coordinate pair string in the following formats:
 * - `lat, lng`
 * - `lat lng` (with a space or a tab)
 * @param input The coordinate pair string to parse.
 * @param clamp Whether to clamp the latitude and longitude values to 6 decimal places.
 * @returns The parsed coordinates as an object, or null if the input is invalid.
 */
export const parseCoordinatePairString = (input: string, clamp = true): null | { lat: number, lng: number } => {
	const regex = /^\s*([+-]?\d+(?:\.\d+)?)\s*(?:,|\s)\s*([+-]?\d+(?:\.\d+)?)\s*$/;
	const match = input.match(regex);
	if (!match) return null;
	const lat = parseFloat(match[1]);
	const lng = parseFloat(match[2]);
	if (clamp) return isValidCoordinatePair(lat, lng) ? { lat: clampCoordinate(lat), lng: clampCoordinate(lng) } : null;
	else return isValidCoordinatePair(lat, lng) ? { lat, lng } : null;
};
