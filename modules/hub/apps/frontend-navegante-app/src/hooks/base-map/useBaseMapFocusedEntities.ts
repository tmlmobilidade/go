'use client';

import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { useStopsMapData } from '@/components/stops/use-stops-map-data';
import { useVehiclePatternData } from '@/components/vehicles/use-vehicle-pattern-data';
import { useVehiclesData } from '@/components/vehicles/use-vehicles-data';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { buildPatternShapeFeature } from '@/utils/map/pattern-shape';
import { getVehiclePatternId } from '@/utils/transit/vehicle-detail';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { useMemo } from 'react';

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
	const { data: stopsFeatureCollection, entities: stops } = useStopsMapData();
	const { data: vehicles } = useVehiclesData();

	const focusedAlertId = activeBottomSheet?.view === 'alerts-detail' ? activeBottomSheet.entityId : null;
	const focusedLineShape = activeBottomSheet?.view === 'lines-detail' ? linesDetailContext.data.active_shape : null;
	const focusedStopId = activeBottomSheet?.view === 'stops-detail' ? activeBottomSheet.entityId : null;
	const focusedVehicleId = activeBottomSheet?.view === 'vehicles-detail' ? activeBottomSheet.entityId : null;

	//
	// B. Fetch data

	const focusedVehicle = useMemo(() => {
		if (!focusedVehicleId) return null;
		return vehicles.find(candidate => candidate.vehicle_id === focusedVehicleId) ?? null;
	}, [focusedVehicleId, vehicles]);

	const focusedVehiclePatternId = getVehiclePatternId(focusedVehicle);
	const { data: patterns } = useVehiclePatternData(focusedVehiclePatternId);
	const pattern = patterns?.[0];

	//
	// C. Transform data

	const focusedStop = useMemo(() => {
		if (!focusedStopId) return null;
		return stops.find(stop => String(stop._id) === focusedStopId) ?? null;
	}, [focusedStopId, stops]);

	const focusedStopMapData = useMemo(() => {
		if (!focusedStopId) return null;

		const collection = getBaseGeoJsonFeatureCollection();
		const feature = stopsFeatureCollection.features.find(item => String(item.properties?._id) === focusedStopId);
		if (feature) collection.features.push(feature);
		return collection;
	}, [focusedStopId, stopsFeatureCollection]);

	const stopsMapData = useMemo(() => {
		if (!focusedStopId) return stopsFeatureCollection;

		return {
			...stopsFeatureCollection,
			features: stopsFeatureCollection.features.filter(feature => String(feature.properties?._id) !== focusedStopId),
		};
	}, [focusedStopId, stopsFeatureCollection]);

	const focusedVehicleShape = useMemo(() => buildPatternShapeFeature(pattern), [pattern]);

	//
	// D. Return data

	return {
		focusedAlertId,
		focusedLineShape,
		focusedStop,
		focusedStopMapData,
		focusedVehicleId,
		focusedVehicleShape,
		pattern,
		stopsMapData,
	};

	//
}
