'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { parseStopsListCoordinates } from './coordinates';

/* * */

interface UseStopsListFilterCoordinatesReturnType extends UseFilterStateTextReturnType {
	coordinates: [number, number] | null
	isInvalid: boolean
}

/** Manages the coordinate filter and validates its URL state. */
export function useStopsListFilterCoordinates(): UseStopsListFilterCoordinatesReturnType {
	const filter = useFilterStateText('coordinates');
	const coordinates = useMemo(() => parseStopsListCoordinates(filter.value), [filter.value]);

	return useMemo(() => ({
		...filter,
		coordinates,
		isActive: coordinates !== null,
		isInvalid: Boolean(filter.value.trim()) && coordinates === null,
	}), [filter, coordinates]);
}
