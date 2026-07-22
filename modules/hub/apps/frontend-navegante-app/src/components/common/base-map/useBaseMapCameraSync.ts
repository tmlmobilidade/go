'use client';

import { useBaseMapDerivedData } from '@/components/common/base-map/useBaseMapDerivedData';
import { useBaseMapFocusedEntities } from '@/components/common/base-map/useBaseMapFocusedEntities';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useMapBottomSheet } from '@/components/common/bottom-sheet/use-map-bottom-sheet';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { centerMap } from '@/utils/map.utils';
import { useMap } from '@vis.gl/react-maplibre';
import { useEffect, useRef } from 'react';

/* * */

interface UseBaseMapCameraSyncParams {
	focusedLineShape: ReturnType<typeof useBaseMapFocusedEntities>['focusedLineShape']
	focusedStop: ReturnType<typeof useBaseMapFocusedEntities>['focusedStop']
	placeDestination: ReturnType<typeof useBaseMapDerivedData>['placeDestination']
	routePlannerMapFitFeatures: ReturnType<typeof useBaseMapDerivedData>['routePlannerMapFitFeatures']
}

/* * */

export function useBaseMapCameraSync(params: UseBaseMapCameraSyncParams) {
	//

	//
	// A. Setup variables

	const routePlannerContext = useRoutePlannerContext();
	const { activeBottomSheet, activeBottomSheetSnap } = useBottomSheet();
	const { mapPadding, shouldFitMap } = useMapBottomSheet();
	const { 'base-map': baseMap } = useMap();
	const lastRouteMapFitKeyRef = useRef<null | string>(null);

	//
	// B. Synchronize camera

	useEffect(() => {
		if (!baseMap || !params.focusedLineShape || !shouldFitMap) return;
		centerMap(baseMap, [params.focusedLineShape], {
			padding: mapPadding,
		});
	}, [activeBottomSheetSnap.snapPoint, baseMap, mapPadding, params.focusedLineShape, shouldFitMap]);

	useEffect(() => {
		if (!baseMap || !params.focusedStop || !shouldFitMap) return;
		baseMap.flyTo({
			center: [params.focusedStop.longitude, params.focusedStop.latitude],
			duration: 650,
			offset: [0, Math.round((mapPadding.top - mapPadding.bottom) / 2)],
			zoom: 15.5,
		});
	}, [activeBottomSheetSnap.snapPoint, baseMap, mapPadding, params.focusedStop, shouldFitMap]);

	useEffect(() => {
		if (!baseMap || !Number.isFinite(params.placeDestination?.lon) || !Number.isFinite(params.placeDestination?.lat) || !shouldFitMap) return;
		baseMap.flyTo({
			center: [params.placeDestination.lon, params.placeDestination.lat],
			duration: 650,
			offset: [0, Math.round((mapPadding.top - mapPadding.bottom) / 2)],
			zoom: 15.5,
		});
	}, [activeBottomSheetSnap.snapPoint, baseMap, mapPadding, params.placeDestination, shouldFitMap]);

	useEffect(() => {
		if (!baseMap || params.routePlannerMapFitFeatures.length === 0) return;
		if (activeBottomSheet?.view !== 'routes' && !routePlannerContext.flags.is_navigating) return;
		if (!shouldFitMap) {
			lastRouteMapFitKeyRef.current = null;
			return;
		}

		const routeMapFitKey = [
			routePlannerContext.data.selected_itinerary_index,
			routePlannerContext.data.view_mode,
			activeBottomSheetSnap.snapPoint,
			params.routePlannerMapFitFeatures.length,
		].join('|');

		if (lastRouteMapFitKeyRef.current === routeMapFitKey) return;
		lastRouteMapFitKeyRef.current = routeMapFitKey;

		centerMap(baseMap, params.routePlannerMapFitFeatures, {
			padding: mapPadding,
		});
	}, [activeBottomSheet?.view, activeBottomSheetSnap.snapPoint, baseMap, mapPadding, params.routePlannerMapFitFeatures, routePlannerContext.data.selected_itinerary_index, routePlannerContext.data.view_mode, routePlannerContext.flags.is_navigating, shouldFitMap]);

	//
}
