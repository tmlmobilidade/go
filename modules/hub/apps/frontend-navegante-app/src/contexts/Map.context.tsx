'use client';

import { useUserLocation } from '@/contexts/UserLocation.context';
import { usePersistedPreference } from '@/hooks/persistence/usePersistedPreference';
import { type BaseMapOperatorId } from '@/lib/agency-catalog';
import { type BaseMapOverlayType } from '@/types/common/map';
import { moveMapView } from '@tmlmobilidade/ui';
import { type MapRef } from '@vis.gl/react-maplibre';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* * */

interface MapContextState {
	actions: {
		moveMap: (params: { isUserInitiated: boolean, latitude: number, longitude: number }) => void
		setMap: (map: MapRef) => void
		toggleBaseMapOperator: (operatorId: BaseMapOperatorId) => void
		toggleBaseMapOverlay: (overlay: BaseMapOverlayType) => void
	}
	data: {
		activeBaseMapOverlays: BaseMapOverlayType[]
		excludedBaseMapOperatorIds: BaseMapOperatorId[]
		map: MapRef | undefined
	}
	flags: {
		is_storage_ready: boolean
	}
}

/* * */

const MapContext = createContext<MapContextState | undefined>(undefined);
const BASE_MAP_OPERATOR_IDS: BaseMapOperatorId[] = ['IA9T6', 'IA2N9', 'N18KL', 'LTP61', 'A3H3M', '7NTB1', 'KB1F6', 'HF16N', 'CM'];
const DEFAULT_BASE_MAP_OVERLAYS: BaseMapOverlayType[] = ['alerts', 'vehicles'];
const DEFAULT_EXCLUDED_OPERATORS: BaseMapOperatorId[] = [];

export function useMapContext() {
	const context = useContext(MapContext);
	if (!context) {
		throw new Error('useMapContext must be used within a MapContextProvider');
	}
	return context;
}

/* * */

export function MapContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const [dataMapState, setDataMapState] = useState<MapContextState['data']['map']>(undefined);

	const { data: { location: userLocation, tracking_mode: userLocationTrackingMode }, flags: { is_storage_ready: isUserLocationStorageReady } } = useUserLocation();

	const [activeBaseMapOverlays, setActiveBaseMapOverlays, areOverlaysReady] = usePersistedPreference('active-viewport-map-sources', DEFAULT_BASE_MAP_OVERLAYS, parseStoredOverlays);
	const [excludedBaseMapOperatorIds, setExcludedBaseMapOperatorIds, areOperatorsReady] = usePersistedPreference('excluded-viewport-map-operators', DEFAULT_EXCLUDED_OPERATORS, parseStoredOperators);

	//
	// B. Handle actions

	const setMap = useCallback((map: MapRef) => {
		setDataMapState(map);
	}, []);

	const moveMap = useCallback((params: { isUserInitiated: boolean, latitude: number, longitude: number }) => {
		if (params.isUserInitiated) dataMapState?.stop();
		moveMapView(dataMapState, [params.longitude, params.latitude], { zoom: 15 });
	}, [dataMapState]);

	const toggleBaseMapOverlay = useCallback((source: BaseMapOverlayType) => {
		setActiveBaseMapOverlays((prev) => {
			// Create a new set with the previous sources
			const result = new Set([...prev]);
			// Toggle the source
			if (result.has(source)) result.delete(source);
			else result.add(source);
			// Return the new sources as an array
			return Array.from(result);
		});
	}, [setActiveBaseMapOverlays]);

	const toggleBaseMapOperator = useCallback((operatorId: BaseMapOperatorId) => {
		setExcludedBaseMapOperatorIds((previousOperatorIds) => {
			const nextOperatorIds = new Set(previousOperatorIds);

			if (nextOperatorIds.has(operatorId)) nextOperatorIds.delete(operatorId);
			else nextOperatorIds.add(operatorId);

			return Array.from(nextOperatorIds);
		});
	}, [setExcludedBaseMapOperatorIds]);

	useEffect(() => {
		if (!isUserLocationStorageReady) return;
		// Skip if the user location tracking mode is idle
		if (userLocationTrackingMode === 'idle') return;
		// Skip if the user location is not available
		if (!Number.isFinite(userLocation?.latitude) || !Number.isFinite(userLocation?.longitude)) return;
		// Get the coordinates and bearing
		const coordinates = [userLocation.longitude, userLocation.latitude];
		const bearing = userLocationTrackingMode === 'follow-bearing' ? userLocation.bearing ?? undefined : undefined;
		// Move the map view
		moveMapView(dataMapState, coordinates, { bearing, zoom: 15 });
	}, [dataMapState, isUserLocationStorageReady, userLocation, userLocationTrackingMode]);

	//
	// C. Define context value

	const contextValue = useMemo<MapContextState>(() => ({
		actions: {
			moveMap,
			setMap,
			toggleBaseMapOperator,
			toggleBaseMapOverlay,
		},
		data: {
			activeBaseMapOverlays,
			excludedBaseMapOperatorIds,
			map: dataMapState,
		},
		flags: {
			is_storage_ready: areOverlaysReady && areOperatorsReady,
		},
	}), [activeBaseMapOverlays, areOperatorsReady, areOverlaysReady, dataMapState, excludedBaseMapOperatorIds, moveMap, setMap, toggleBaseMapOperator, toggleBaseMapOverlay]);

	//
	// D. Render components

	return (
		<MapContext.Provider value={contextValue}>
			{children}
		</MapContext.Provider>
	);
}

/* * */

function parseStoredList<T extends string>(value: string, fallback: T[], allowed: T[]): T[] {
	try {
		const parsed: unknown = JSON.parse(value);
		return Array.isArray(parsed) ? parsed.filter((item): item is T => typeof item === 'string' && allowed.includes(item as T)) : fallback;
	} catch {
		return fallback;
	}
}

function parseStoredOverlays(value: string): BaseMapOverlayType[] {
	return parseStoredList(value, DEFAULT_BASE_MAP_OVERLAYS, DEFAULT_BASE_MAP_OVERLAYS);
}

function parseStoredOperators(value: string): BaseMapOperatorId[] {
	return parseStoredList(value, DEFAULT_EXCLUDED_OPERATORS, BASE_MAP_OPERATOR_IDS);
}
