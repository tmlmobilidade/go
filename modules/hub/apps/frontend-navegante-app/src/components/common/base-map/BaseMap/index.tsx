'use client';

import { useBaseMapDerivedData } from '@/components/common/base-map/useBaseMapDerivedData';
import { useBaseMapFocusedEntities } from '@/components/common/base-map/useBaseMapFocusedEntities';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useMapBottomSheet } from '@/components/common/bottom-sheet/use-map-bottom-sheet';
import { useMapContext } from '@/components/map/Map.context';
import { MapView } from '@/components/map/MapView';
import { MapViewOverlayPlaceLocation } from '@/components/map/overlays/MapViewOverlayPlaceLocation';
import { MapViewOverlayStopLineBadges } from '@/components/map/overlays/MapViewOverlayStopLineBadges';
import { MapViewOverlayStops, MapViewOverlayStopsInteractiveLayerId, MapViewOverlayStopsVisibleMinZoom } from '@/components/map/overlays/MapViewOverlayStops';
import { MapViewOverlayUserLocation } from '@/components/map/overlays/MapViewOverlayUserLocation';
// import { MapViewOverlayVehicleLineBadges } from '@/components/map/overlays/MapViewOverlayVehicleLineBadges';
import { MapViewOverlayVehicles, MapViewOverlayVehiclesInteractiveLayerId, MapViewOverlayVehiclesPrimaryLayerId } from '@/components/map/overlays/MapViewOverlayVehicles';
import { MapViewStyleActiveStops } from '@/components/map/overlays/MapViewStyleActiveStops';
import { MapViewStyleAlerts, MapViewStyleAlertsInteractiveLayerId } from '@/components/map/overlays/MapViewStyleAlerts';
import { MapViewStylePath } from '@/components/map/overlays/MapViewStylePath';
import { useUserLocation } from '@/components/map/use-user-location';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { type MapLongPressLocation, useMapLongPress } from '@/hooks/useMapLongPress';
import { centerMap } from '@/utils/map.utils';
import { type MapLayerMouseEvent, useMap, type ViewStateChangeEvent } from '@vis.gl/react-maplibre';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

const baseMapInteractiveLayerIds = [
	MapViewOverlayVehiclesPrimaryLayerId,
	MapViewOverlayStopsInteractiveLayerId,
	MapViewStyleAlertsInteractiveLayerId,
];

/* * */

export function BaseMap() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();

	const { data: { activeBaseMapOverlays, excludedBaseMapOperatorIds } } = useMapContext();
	const { setUserLocationTrackingMode, userLocation } = useUserLocation();
	const { activeBottomSheet, activeBottomSheetSnap, setActiveBottomSheet } = useBottomSheet();
	const { collapseForMapInteraction, mapPadding, shouldFitMap } = useMapBottomSheet();

	const { 'base-map': baseMap } = useMap();
	const lastRouteMapFitKeyRef = useRef<null | string>(null);
	const [selectedMapLocation, setSelectedMapLocation] = useState<MapLongPressLocation | null>(null);
	const mapLongPress = useMapLongPress(setSelectedMapLocation);

	const {
		focusedAlertId,
		focusedLineShape,
		focusedStop,
		focusedStopMapData,
		focusedVehicleId,
		pattern,
		shape,
		stopsMapData,
	} = useBaseMapFocusedEntities({ activeBottomSheet });

	const {
		alertsMapData: operatorFilteredAlertsMapData,
		placeDestination,
		routePlannerContextShapeData,
		routePlannerMapFitFeatures,
		shouldAlwaysShowFilteredVehicles,
		vehiclesMapData: operatorFilteredVehiclesMapData,
	} = useBaseMapDerivedData({
		activeBottomSheet,
		excludedOperatorIds: excludedBaseMapOperatorIds,
		focusedAlertId,
		focusedVehicleId,
	});

	useEffect(() => {
		if (!baseMap || !focusedAlertId || !activeBaseMapOverlays.includes('alerts')) return;

		const focusedFeature = operatorFilteredAlertsMapData.features.find(
			feature => feature.geometry?.type === 'Point',
		);

		if (!focusedFeature || focusedFeature.geometry?.type !== 'Point') return;

		// moveMap(viewportMap, focusedFeature.geometry.coordinates);
	}, [activeBaseMapOverlays, baseMap, focusedAlertId, operatorFilteredAlertsMapData.features]);

	useEffect(() => {
		if (!baseMap || !focusedLineShape) return;
		if (!shouldFitMap) return;
		centerMap(baseMap, [focusedLineShape], {
			padding: mapPadding,
		});
	}, [activeBottomSheetSnap.snapPoint, baseMap, focusedLineShape, mapPadding, shouldFitMap]);

	useEffect(() => {
		if (!baseMap || !focusedStop || !shouldFitMap) return;
		baseMap.flyTo({
			center: [focusedStop.longitude, focusedStop.latitude],
			duration: 650,
			offset: [0, Math.round((mapPadding.top - mapPadding.bottom) / 2)],
			zoom: 15.5,
		});
	}, [activeBottomSheetSnap.snapPoint, baseMap, focusedStop, mapPadding, shouldFitMap]);

	useEffect(() => {
		if (!baseMap || !shape?.geojson) return;

		// centerMap(viewportMap, [shape.geojson], {
		// 	padding: { bottom: 320, left: 80, right: 80, top: 80 },
		// });
	}, [baseMap, shape?.geojson]);

	useEffect(() => {
		if (!baseMap || !Number.isFinite(placeDestination?.lon) || !Number.isFinite(placeDestination?.lat)) return;
		if (!shouldFitMap) return;
		baseMap.flyTo({
			center: [placeDestination.lon, placeDestination.lat],
			duration: 650,
			offset: [0, Math.round((mapPadding.top - mapPadding.bottom) / 2)],
			zoom: 15.5,
		});
	}, [activeBottomSheetSnap.snapPoint, baseMap, mapPadding, placeDestination, shouldFitMap]);

	useEffect(() => {
		if (!baseMap || routePlannerMapFitFeatures.length === 0) return;
		if (activeBottomSheet?.view !== 'routes' && !routePlannerContext.flags.is_navigating) return;
		if (!shouldFitMap) {
			lastRouteMapFitKeyRef.current = null;
			return;
		}

		const routeMapFitKey = [
			routePlannerContext.data.selected_itinerary_index,
			routePlannerContext.data.view_mode,
			activeBottomSheetSnap.snapPoint,
			routePlannerMapFitFeatures.length,
		].join('|');

		if (lastRouteMapFitKeyRef.current === routeMapFitKey) return;
		lastRouteMapFitKeyRef.current = routeMapFitKey;

		centerMap(baseMap, routePlannerMapFitFeatures, {
			padding: mapPadding,
		});
	}, [activeBottomSheet?.view, activeBottomSheetSnap.snapPoint, baseMap, mapPadding, routePlannerContext.data.selected_itinerary_index, routePlannerContext.data.view_mode, routePlannerContext.flags.is_navigating, routePlannerMapFitFeatures, shouldFitMap]);

	//
	// C. Handle actions

	const handleMapClick = (event: MapLayerMouseEvent) => {
		if (mapLongPress.consumeTriggeredClick()) return;

		setSelectedMapLocation(null);

		if (!event.features?.length) return;

		const feature = event.features[0];
		const layerId = feature.layer?.id;

		if (layerId === MapViewOverlayStopsInteractiveLayerId) {
			if (!baseMap || baseMap.getZoom() <= MapViewOverlayStopsVisibleMinZoom) return;
			if (!feature.properties._id) return;
			setActiveBottomSheet({ entityId: String(feature.properties._id), view: 'stops-detail' });
			return;
		}

		if (layerId === MapViewStyleAlertsInteractiveLayerId) {
			if (!feature.properties._id) return;
			setActiveBottomSheet({ entityId: String(feature.properties._id), view: 'alerts-detail' });
			return;
		}

		if (layerId === MapViewOverlayVehiclesInteractiveLayerId) {
			if (!feature.properties.vehicle_id) return;
			setActiveBottomSheet({ entityId: String(feature.properties.vehicle_id), view: 'vehicles-detail' });
			return;
		}
	};

	const handleGetDirections = () => {
		if (!selectedMapLocation) return;

		const location = selectedMapLocation;
		setSelectedMapLocation(null);
		void routePlannerContext.actions.openDirectionsTo({
			detail: `${location.latitude}, ${location.longitude}`,
			label: t('default:map.MapLocationPin.selected_location'),
			lat: location.latitude,
			lon: location.longitude,
			type: 'PLACE',
		});
	};

	const handleMapDrag = (event: ViewStateChangeEvent) => {
		mapLongPress.cancel();
		setUserLocationTrackingMode('idle');
		collapseForMapInteraction(event);
	};

	const handleMapZoom = (event: ViewStateChangeEvent) => {
		mapLongPress.cancel();
		collapseForMapInteraction(event);
	};

	//
	// B. Render components

	return (
		<MapView
			id="base-map"
			interactiveLayerIds={baseMapInteractiveLayerIds}
			onClick={handleMapClick}
			onDrag={handleMapDrag}
			onMouseDown={mapLongPress.handlePressStart}
			onMouseLeave={mapLongPress.cancel}
			onMouseMove={mapLongPress.handlePressMove}
			onMouseUp={mapLongPress.cancel}
			onTouchCancel={mapLongPress.cancel}
			onTouchEnd={mapLongPress.cancel}
			onTouchMove={mapLongPress.handlePressMove}
			onTouchStart={mapLongPress.handlePressStart}
			onZoom={handleMapZoom}
		>

			<MapViewOverlayStops
				stopsData={stopsMapData}
				visible
			/>
			<MapViewOverlayStopLineBadges
				visible
			/>

			{focusedStopMapData && (
				<MapViewStyleActiveStops
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					stopsData={focusedStopMapData}
				/>
			)}

			{focusedLineShape && (
				<MapViewStylePath
					idPrefix="line-detail"
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={focusedLineShape}
				/>
			)}

			{shape?.geojson && pattern && (
				<MapViewStylePath
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={{
						...shape.geojson,
						properties: {
							color: pattern.color,
							text_color: pattern.text_color,
						},
					}}
				/>
			)}

			{routePlannerContextShapeData.features.length > 0 && (
				<MapViewStylePath
					idPrefix="route-planner-context"
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={routePlannerContextShapeData}
					variant="context"
				/>
			)}

			{routePlannerContext.data.route_map_data.shapeData.features.length > 0 && (
				<MapViewStylePath
					idPrefix="route-planner"
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={routePlannerContext.data.route_map_data.shapeData}
					waypointsData={routePlannerContext.data.route_map_data.waypointsData}
				/>
			)}

			<MapViewOverlayVehicles
				alwaysShowVehicles={shouldAlwaysShowFilteredVehicles}
				vehiclesData={operatorFilteredVehiclesMapData}
				visible={activeBaseMapOverlays.includes('vehicles')}
			/>
			{/* <MapViewOverlayVehicleLineBadges
				visible={activeBaseMapOverlays.includes('vehicles')}
			/> */}

			<MapViewStyleAlerts
				data={operatorFilteredAlertsMapData}
				visible={activeBaseMapOverlays.includes('alerts')}
			/>
			<MapViewOverlayPlaceLocation
				latitude={placeDestination?.lat}
				longitude={placeDestination?.lon}
				visible={Boolean(placeDestination)}
			/>
			<MapViewOverlayPlaceLocation
				directionsLabel={t('default:map.MapLocationPin.get_directions')}
				latitude={selectedMapLocation?.latitude}
				longitude={selectedMapLocation?.longitude}
				onDirections={handleGetDirections}
				visible={Boolean(selectedMapLocation)}
			/>
			<MapViewOverlayUserLocation
				latitude={userLocation?.latitude}
				longitude={userLocation?.longitude}
			/>
		</MapView>
	);
}
