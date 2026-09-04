'use client';

import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubPattern, type HubShape } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
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
		const vehicle = vehiclesContext.data.vehicles.find(candidate => candidate.vehicle_id === focusedVehicleId);
		if (!vehicle?.route_id || vehicle.direction_id === undefined) return null;
		return `${vehicle.route_id}_${vehicle.direction_id}`;
	}, [focusedVehicleId, vehiclesContext.data.vehicles]);

	const { data: patternsResponse } = useSWR<ApiResponse<HubPattern[]>>(focusedVehiclePatternId ? API_ROUTES.hub.NETWORK_PATTERNS(focusedVehiclePatternId) : null, {
		fetcher: async url => await fetchApiData<HubPattern[]>({ options: { credentials: 'omit' }, url }),
	});
	const pattern = patternsResponse?.data?.[0];

	const { data: shapeResponse } = useSWR<ApiResponse<HubShape>>(pattern?.shape_id ? API_ROUTES.hub.NETWORK_SHAPES(pattern.shape_id) : null, {
		fetcher: async url => await fetchApiData<HubShape>({ options: { credentials: 'omit' }, url }),
	});
	const shape = shapeResponse?.data;

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
