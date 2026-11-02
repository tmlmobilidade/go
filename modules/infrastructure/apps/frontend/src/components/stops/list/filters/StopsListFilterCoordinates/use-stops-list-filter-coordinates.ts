'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { parseStopsListCoordinates } from './coordinates';

/* * */

interface UseStopsListFilterCoordinatesReturnType extends UseFilterStateTextReturnType {
	coordinates: [longitude: number, latitude: number] | null
	isInvalid: boolean
}

/**
 * Manages the coordinate filter for the stops list and validates its URL state.
 * @returns The URL state and the validated search centre in GeoJSON order.
 */
export function useStopsListFilterCoordinates(): UseStopsListFilterCoordinatesReturnType {
	//

	const filterCoordinates = useFilterStateText('coordinates');

	const coordinates = useMemo(() => parseStopsListCoordinates(filterCoordinates.value), [filterCoordinates.value]);

	return useMemo(() => ({
		...filterCoordinates,
		coordinates,
		isActive: coordinates !== null,
		isInvalid: Boolean(filterCoordinates.value.trim()) && coordinates === null,
	}), [filterCoordinates, coordinates]);
}
