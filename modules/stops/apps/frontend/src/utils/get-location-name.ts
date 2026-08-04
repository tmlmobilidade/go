import { type LocationEntity, type LocationEntityWithProperties } from '@/types/locations';

/* * */

export function getLocationName(location: LocationEntity | null, isLoading: boolean) {
	if (isLoading) return 'A carregar...';

	const locationWithProperties = location as LocationEntityWithProperties | null;
	return locationWithProperties?.properties?.name ?? location?.name ?? 'N/A';
}
