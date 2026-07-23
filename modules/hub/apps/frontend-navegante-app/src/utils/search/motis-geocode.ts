import { type MotisGeocodeResult, type RoutePlannerLocation } from '@/types/route-planner/models';
import { formatMotisLocationDetail } from '@/utils/route-planner/presentation/format';

/* * */

export function getMotisPlaceParam(location: RoutePlannerLocation) {
	if (location.type === 'STOP' && location.id) return `GTFS_${location.id.replace(/^GTFS_/, '')}`;

	if (Number.isFinite(location.lat) && Number.isFinite(location.lon)) {
		const level = Number.isFinite(location.level) ? `,${location.level}` : '';
		return `${location.lat},${location.lon}${level}`;
	}

	return location.label;
}

export function mapMotisGeocodeResultToLocation(result: MotisGeocodeResult, unnamedLocationLabel: string): RoutePlannerLocation {
	const label = result.name || formatCoordinateLabel(result.lat, result.lon) || unnamedLocationLabel;

	return {
		areas: result.areas,
		category: result.category,
		country: result.country,
		detail: formatMotisLocationDetail(result),
		houseNumber: result.houseNumber,
		id: result.id,
		label,
		lat: result.lat,
		level: result.level,
		lon: result.lon,
		modes: result.modes,
		street: result.street,
		type: result.type || 'PLACE',
		zip: result.zip,
	};
}

export function parseRoutePlannerCoordinate(value: string) {
	const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
	if (!match) return null;

	const lat = Number(match[1]);
	const lon = Number(match[2]);
	if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
		return null;
	}

	return { lat, lon };
}

export function routePlannerCoordinateToLocation(value: string, coordinatesLabel: string): null | RoutePlannerLocation {
	const coordinate = parseRoutePlannerCoordinate(value);
	if (!coordinate) return null;

	const label = `${coordinate.lat},${coordinate.lon}`;

	return {
		detail: `${coordinatesLabel} | ${coordinate.lat.toFixed(5)}, ${coordinate.lon.toFixed(5)}`,
		label,
		lat: coordinate.lat,
		lon: coordinate.lon,
		type: 'PLACE',
	};
}

/* * */

function formatCoordinateLabel(lat: number | undefined, lon: number | undefined) {
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
	return `${lat},${lon}`;
}
