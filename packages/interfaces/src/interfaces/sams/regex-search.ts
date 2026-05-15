/* * */

// Regex to match vehicle searches in the format: "v:123,456,789"
export const SAMS_VEHICLE_SEARCH_REGEX = /^v:(?<vehicleIds>\d+(?:\s*,\s*\d+)*)$/i;

// Regex to match device searches in the format: "d:A1,B2,C3"
export const SAMS_DEVICE_SEARCH_REGEX = /^d:(?<deviceIds>[^,\s]+(?:\s*,\s*[^,\s]+)*)$/i;

/**
 * Parses a sams vehicle search string (e.g., "v:123,456").
 * Returns a deduplicated array of vehicle IDs as numbers.
 * Returns an empty array if the pattern does not match.
 *
 * @param searchRaw - The raw vehicle search string
 */
export function parseSamsVehicleSearch(searchRaw: string): number[] {
	// Remove any leading/trailing whitespace
	const normalizedSearch = searchRaw.trim();

	// Execute regex to extract vehicleIds group
	const regexMatch = SAMS_VEHICLE_SEARCH_REGEX.exec(normalizedSearch);

	// If there is no match or vehicleIds group, return []
	if (!regexMatch?.groups?.vehicleIds) return [];

	// Split by comma, trim whitespace, convert to numbers, and filter invalid numbers
	// Use Set to remove duplicates
	return [
		...new Set(
			regexMatch.groups.vehicleIds
				.split(',')
				.map(item => Number(item.trim()))
				.filter(item => Number.isInteger(item)),
		),
	];
}

/**
 * Parses a sams device search string (e.g., "d:DEVICE1,DEVICE2").
 * Returns a deduplicated array of device IDs as strings.
 * Returns an empty array if the pattern does not match.
 *
 * @param searchRaw - The raw device search string
 */
export function parseSamsDeviceSearch(searchRaw: string): string[] {
	// Remove any leading/trailing whitespace
	const normalizedSearch = searchRaw.trim();

	// Execute regex to extract deviceIds group
	const regexMatch = SAMS_DEVICE_SEARCH_REGEX.exec(normalizedSearch);

	// If there is no match or deviceIds group, return []
	if (!regexMatch?.groups?.deviceIds) return [];

	// Split by comma, trim whitespace, filter out empty values
	// Use Set to remove duplicates
	return [
		...new Set(
			regexMatch.groups.deviceIds
				.split(',')
				.map(item => item.trim())
				.filter(Boolean),
		),
	];
}
