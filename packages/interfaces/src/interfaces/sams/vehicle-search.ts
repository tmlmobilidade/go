/* * */

export const SAMS_VEHICLE_SEARCH_REGEX = /^v:(?<vehicleIds>\d+(?:\s*,\s*\d+)*)$/i;
export const SAMS_DEVICE_SEARCH_REGEX = /^d:(?<deviceIds>[^,\s]+(?:\s*,\s*[^,\s]+)*)$/i;

export function parseSamsVehicleSearch(searchRaw: string): number[] {
	const normalizedSearch = searchRaw.trim();
	const regexMatch = SAMS_VEHICLE_SEARCH_REGEX.exec(normalizedSearch);
	if (!regexMatch?.groups?.vehicleIds) return [];

	return [
		...new Set(
			regexMatch.groups.vehicleIds
				.split(',')
				.map(item => Number(item.trim()))
				.filter(item => Number.isInteger(item)),
		),
	];
}

export function parseSamsDeviceSearch(searchRaw: string): string[] {
	const normalizedSearch = searchRaw.trim();
	const regexMatch = SAMS_DEVICE_SEARCH_REGEX.exec(normalizedSearch);
	if (!regexMatch?.groups?.deviceIds) return [];

	return [
		...new Set(
			regexMatch.groups.deviceIds
				.split(',')
				.map(item => item.trim())
				.filter(Boolean),
		),
	];
}
