'use client';

import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { MAP_BOTTOM_SHEET_MIDDLE_SNAP, MAP_BOTTOM_SHEET_SNAP_POINTS } from '@/constants/bottom-sheet';
import { useUserLocation } from '@/contexts/UserLocation.context';
import { useBaseMapDerivedData } from '@/hooks/base-map/useBaseMapDerivedData';
import { useBaseMapFocusedEntities } from '@/hooks/base-map/useBaseMapFocusedEntities';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useMapBottomSheet } from '@/hooks/bottom-sheet/useMapBottomSheet';
import { centerMap } from '@/utils/map/map';
import { useMap } from '@vis.gl/react-maplibre';
import { useEffect, useRef } from 'react';

/* * */

interface UseBaseMapCameraSyncParams {
	focusedAlert: ReturnType<typeof useBaseMapDerivedData>['focusedAlert']
	focusedLineShape: ReturnType<typeof useBaseMapFocusedEntities>['focusedLineShape']
	focusedStop: ReturnType<typeof useBaseMapFocusedEntities>['focusedStop']
	focusedVehicle: ReturnType<typeof useBaseMapDerivedData>['focusedVehicle']
	placeDestination: ReturnType<typeof useBaseMapDerivedData>['placeDestination']
	routePlannerMapFitFeatures: ReturnType<typeof useBaseMapDerivedData>['routePlannerMapFitFeatures']
}

/* * */

export function useBaseMapCameraSync(params: UseBaseMapCameraSyncParams, { mapPadding, shouldFitMap }: Pick<ReturnType<typeof useMapBottomSheet>, 'mapPadding' | 'shouldFitMap'>) {
	//

	//
	// A. Setup variables

	const routePlannerContext = useRoutePlannerContext();
	const { actions: { setTrackingMode } } = useUserLocation();
	const { activeBottomSheet, activeBottomSheetSnap, restoredSnapIndex } = useBottomSheet();
	const { 'base-map': baseMap } = useMap();
	const lastRouteMapFitKeyRef = useRef<null | string>(null);
	const lastFocusedDetailKeyRef = useRef<null | string>(null);
	const detailView = activeBottomSheet?.view;
	const detailId = activeBottomSheet?.entityId;

	//
	// B. Synchronize camera

	// Focus a selected detail when it opens or the sheet snaps, but not when its live data changes.
	useEffect(() => {
		if (!detailId || (detailView !== 'alerts-detail' && detailView !== 'stops-detail' && detailView !== 'vehicles-detail')) {
			lastFocusedDetailKeyRef.current = null;
			return;
		}
		if (!baseMap || !shouldFitMap) return;
		if (detailView === 'stops-detail' && !lastFocusedDetailKeyRef.current?.startsWith(`${detailView}:${detailId}:`)) {
			const initialSnapIndex = restoredSnapIndex !== null && restoredSnapIndex > 0 && restoredSnapIndex < MAP_BOTTOM_SHEET_SNAP_POINTS.length
				? restoredSnapIndex
				: MAP_BOTTOM_SHEET_MIDDLE_SNAP;
			if (activeBottomSheetSnap.snapPoint !== MAP_BOTTOM_SHEET_SNAP_POINTS[initialSnapIndex]) return;
		}

		let coordinates: number[] | undefined;
		if (detailView === 'stops-detail' && params.focusedStop) {
			coordinates = [params.focusedStop.longitude, params.focusedStop.latitude];
		} else if (detailView === 'alerts-detail' && params.focusedAlert?.geometry.type === 'Point') {
			coordinates = params.focusedAlert.geometry.coordinates;
		} else if (detailView === 'vehicles-detail' && params.focusedVehicle?.geometry.type === 'Point') {
			coordinates = params.focusedVehicle.geometry.coordinates;
		}
		if (!coordinates?.every(Number.isFinite)) return;

		const detailKey = `${detailView}:${detailId}:${activeBottomSheetSnap.snapPoint}`;
		if (lastFocusedDetailKeyRef.current === detailKey) return;
		lastFocusedDetailKeyRef.current = detailKey;
		baseMap.easeTo({
			center: [coordinates[0], coordinates[1]],
			duration: 650,
			offset: [0, Math.round((mapPadding.top - mapPadding.bottom) / 2)],
			zoom: detailView === 'stops-detail' ? Math.max(baseMap.getZoom(), 15.5) : baseMap.getZoom(),
		});
	}, [activeBottomSheetSnap.snapPoint, baseMap, detailId, detailView, mapPadding, params.focusedAlert, params.focusedStop, params.focusedVehicle, restoredSnapIndex, shouldFitMap]);

	// Fit the selected line's complete shape when the available map area changes.
	useEffect(() => {
		if (!baseMap || !params.focusedLineShape || !shouldFitMap) return;
		centerMap(baseMap, [params.focusedLineShape], {
			padding: mapPadding,
		});
	}, [activeBottomSheetSnap.snapPoint, baseMap, mapPadding, params.focusedLineShape, shouldFitMap]);

	// Show a chosen place at the close zoom used by the route planner.
	useEffect(() => {
		if (!baseMap || !Number.isFinite(params.placeDestination?.lon) || !Number.isFinite(params.placeDestination?.lat) || !shouldFitMap) return;
		baseMap.flyTo({
			center: [params.placeDestination.lon, params.placeDestination.lat],
			duration: 650,
			offset: [0, Math.round((mapPadding.top - mapPadding.bottom) / 2)],
			zoom: 15.5,
		});
	}, [activeBottomSheetSnap.snapPoint, baseMap, mapPadding, params.placeDestination, shouldFitMap]);

	// Fit an itinerary while previewing it; navigation follows the user's location instead.
	useEffect(() => {
		if (!baseMap || params.routePlannerMapFitFeatures.length === 0) return;
		if (routePlannerContext.flags.is_navigating) return;
		if (activeBottomSheet?.view !== 'routes') return;
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

		// Previewing an itinerary takes camera control, just like dragging the map.
		// The location button can explicitly resume following afterwards.
		setTrackingMode('idle');
		centerMap(baseMap, params.routePlannerMapFitFeatures, {
			padding: mapPadding,
		});
	}, [activeBottomSheet?.view, activeBottomSheetSnap.snapPoint, baseMap, mapPadding, params.routePlannerMapFitFeatures, routePlannerContext.data.selected_itinerary_index, routePlannerContext.data.view_mode, routePlannerContext.flags.is_navigating, setTrackingMode, shouldFitMap]);

	//
}
