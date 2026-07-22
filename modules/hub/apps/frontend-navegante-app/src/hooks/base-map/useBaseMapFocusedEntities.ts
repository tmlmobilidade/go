'use client';

import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubPattern, type HubShape } from '@tmlmobilidade/go-types-public-info';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseBaseMapFocusedEntitiesParams {
	activeBottomSheet: ReturnType<typeof useBottomSheet>['activeBottomSheet']
}

/* * */

export function useBaseMapFocusedEntities({ activeBottomSheet }: UseBaseMapFocusedEntitiesParams) {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();
	const stopsContext = useStopsContext();
	const vehiclesContext = useVehiclesContext();

	const focusedAlertId = activeBottomSheet?.view === 'alerts-detail' ? activeBottomSheet.entityId : null;
	const focusedLineShape = activeBottomSheet?.view === 'lines-detail' ? linesDetailContext.data.active_shape?.geojson : null;
	const focusedStopId = activeBottomSheet?.view === 'stops-detail' ? activeBottomSheet.entityId : null;
	const focusedVehicleId = activeBottomSheet?.view === 'vehicles-detail' ? activeBottomSheet.entityId : null;

	//
	// B. Fetch data

	const focusedVehiclePatternId = useMemo(() => {
		if (!focusedVehicleId) return null;
		return vehiclesContext.data.vehicles.find(vehicle => vehicle.vehicle_id === focusedVehicleId)?.pattern_id ?? null;
	}, [focusedVehicleId, vehiclesContext.data.vehicles]);

	const { data: patterns } = useSWR<HubPattern[]>(
		focusedVehiclePatternId ? { credentials: 'omit', url: API_ROUTES.hub.NETWORK_PATTERNS(focusedVehiclePatternId) } : null,
	);
	const pattern = patterns?.[0];

	const { data: shape } = useSWR<HubShape>(
		pattern?.shape_id ? { credentials: 'omit', url: API_ROUTES.hub.NETWORK_SHAPES(pattern.shape_id) } : null,
	);

	//
	// C. Transform data

	const focusedStop = useMemo(() => {
		if (!focusedStopId) return null;
		return stopsContext.data.stops.find(stop => String(stop._id) === focusedStopId) ?? null;
	}, [focusedStopId, stopsContext.data.stops]);

	const focusedStopMapData = useMemo(() => {
		if (!focusedStopId) return null;

		const collection = getBaseGeoJsonFeatureCollection();
		const feature = stopsContext.data.fc.features.find(item => String(item.properties?._id) === focusedStopId);
		if (feature) collection.features.push(feature);
		return collection;
	}, [focusedStopId, stopsContext.data.fc]);

	const stopsMapData = useMemo(() => {
		if (!focusedStopId) return stopsContext.data.fc;

		return {
			...stopsContext.data.fc,
			features: stopsContext.data.fc.features.filter(feature => String(feature.properties?._id) !== focusedStopId),
		};
	}, [focusedStopId, stopsContext.data.fc]);

	//
	// D. Return data

	return {
		focusedAlertId,
		focusedLineShape,
		focusedStop,
		focusedStopMapData,
		focusedVehicleId,
		pattern,
		shape,
		stopsMapData,
	};

	//
}
