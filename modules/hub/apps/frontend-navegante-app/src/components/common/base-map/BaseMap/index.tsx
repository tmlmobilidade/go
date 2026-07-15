'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useLinesContext } from '@/components/lines/Lines.context';
import { useMapContext } from '@/components/map/Map.context';
import { MapView } from '@/components/map/MapView';
import { MapViewOverlayStopLineBadges } from '@/components/map/overlays/MapViewOverlayStopLineBadges';
import { MapViewOverlayStops, MapViewOverlayStopsInteractiveLayerId } from '@/components/map/overlays/MapViewOverlayStops';
import { MapViewOverlayUserLocation } from '@/components/map/overlays/MapViewOverlayUserLocation';
// import { MapViewOverlayVehicleLineBadges } from '@/components/map/overlays/MapViewOverlayVehicleLineBadges';
import { MapViewOverlayVehicles, MapViewOverlayVehiclesInteractiveLayerId, MapViewOverlayVehiclesPrimaryLayerId } from '@/components/map/overlays/MapViewOverlayVehicles';
import { MapViewStyleAlerts, MapViewStyleAlertsInteractiveLayerId } from '@/components/map/overlays/MapViewStyleAlerts';
import { MapViewStylePath } from '@/components/map/overlays/MapViewStylePath';
import { useUserLocation } from '@/components/map/use-user-location';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { centerMap } from '@/utils/map.utils';
import { buildRoutePlannerAlertFeatureCollection, filterAlertsByRoutePlannerItinerary, getRoutePlannerItineraryAlertFilters } from '@/utils/route-planner-alerts';
import { filterVehicleFeatureCollectionByLineIds, getRoutePlannerItineraryLineIds } from '@/utils/route-planner-vehicles';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubPattern, type HubShape } from '@tmlmobilidade/go-types-public-info';
import { type MapLayerMouseEvent, useMap } from '@vis.gl/react-maplibre';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function BaseMap() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const alertsContext = useAlertsContext();
	const linesContext = useLinesContext();
	const vehiclesContext = useVehiclesContext();
	const routePlannerContext = useRoutePlannerContext();

	const { data: { activeBaseMapOverlays } } = useMapContext();
	const { setUserLocationTrackingMode, userLocation } = useUserLocation();
	const { activeBottomSheet, setActiveBottomSheet } = useBottomSheet();

	const { 'base-map': baseMap } = useMap();

	const focusedAlertId = activeBottomSheet?.view === 'alerts-detail' ? activeBottomSheet.entityId : null;
	const focusedVehicleId = activeBottomSheet?.view === 'vehicles-detail' ? activeBottomSheet.entityId : null;

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

	const routePlannerAlertFilters = useMemo(() => {
		return getRoutePlannerItineraryAlertFilters(routePlannerContext.data.selected_itinerary, linesContext.data.lines);
	}, [linesContext.data.lines, routePlannerContext.data.selected_itinerary]);

	const routePlannerAlerts = useMemo(() => {
		return filterAlertsByRoutePlannerItinerary(alertsContext.data.alerts, routePlannerAlertFilters);
	}, [alertsContext.data.alerts, routePlannerAlertFilters]);

	const routePlannerAlertsMapData = useMemo(() => {
		if (!routePlannerAlertFilters) return alertsContext.data.fc;
		return buildRoutePlannerAlertFeatureCollection(alertsContext.data.fc, routePlannerAlerts, routePlannerContext.data.route_map_data, linesContext.data.lines);
	}, [alertsContext.data.fc, linesContext.data.lines, routePlannerAlertFilters, routePlannerAlerts, routePlannerContext.data.route_map_data]);

	const alertsMapData = useMemo(() => {
		if (!focusedAlertId) return routePlannerAlertsMapData;

		const collection = getBaseGeoJsonFeatureCollection();

		alertsContext.data.fc.features.forEach((feature) => {
			const featureId = feature.properties?.id ?? feature.properties?._id;

			if (featureId === focusedAlertId) collection.features.push(feature);
		});

		return collection;
	}, [alertsContext.data.fc, focusedAlertId, routePlannerAlertsMapData]);

	const routePlannerVehicleLineIds = useMemo(() => {
		return getRoutePlannerItineraryLineIds(routePlannerContext.data.selected_itinerary, linesContext.data.lines);
	}, [linesContext.data.lines, routePlannerContext.data.selected_itinerary]);

	const shouldAlwaysShowRoutePlannerVehicles = routePlannerVehicleLineIds !== null;

	const routePlannerVehiclesMapData = useMemo(() => {
		return filterVehicleFeatureCollectionByLineIds(vehiclesContext.data.fc, routePlannerVehicleLineIds);
	}, [routePlannerVehicleLineIds, vehiclesContext.data.fc]);

	const vehiclesMapData = useMemo(() => {
		if (!focusedVehicleId) return routePlannerVehiclesMapData;

		const collection = getBaseGeoJsonFeatureCollection();

		vehiclesContext.data.fc.features.forEach((feature) => {
			if (feature.properties?.vehicle_id === focusedVehicleId) collection.features.push(feature);
		});

		return collection;
	}, [focusedVehicleId, routePlannerVehiclesMapData, vehiclesContext.data.fc]);

	useEffect(() => {
		if (!baseMap || !focusedAlertId || !activeBaseMapOverlays.includes('alerts')) return;

		const focusedFeature = alertsMapData.features.find(
			feature => feature.geometry?.type === 'Point',
		);

		if (!focusedFeature || focusedFeature.geometry?.type !== 'Point') return;

		// moveMap(viewportMap, focusedFeature.geometry.coordinates);
	}, [baseMap, focusedAlertId, alertsMapData.features, activeBaseMapOverlays]);

	useEffect(() => {
		if (!baseMap || !shape?.geojson) return;

		// centerMap(viewportMap, [shape.geojson], {
		// 	padding: { bottom: 320, left: 80, right: 80, top: 80 },
		// });
	}, [baseMap, shape?.geojson]);

	useEffect(() => {
		if (!baseMap || routePlannerContext.data.route_map_data.shapeData.features.length === 0) return;

		centerMap(baseMap, routePlannerContext.data.route_map_data.shapeData.features, {
			padding: getRoutePlannerMapFitPadding(routePlannerContext.data.view_mode),
		});
	}, [baseMap, routePlannerContext.data.selected_itinerary_index, routePlannerContext.data.route_map_data.shapeData, routePlannerContext.data.view_mode]);

	//
	// C. Handle actions

	const handleMapClick = (event: MapLayerMouseEvent) => {
		if (!event.features?.length) return;

		const feature = event.features[0];
		const layerId = feature.layer?.id;

		if (layerId === MapViewOverlayStopsInteractiveLayerId) {
			if (!feature.properties._id) return;
			setActiveBottomSheet({ entityId: String(feature.properties._id), view: 'stops-detail' }, { replace: true });
			return;
		}

		if (layerId === MapViewStyleAlertsInteractiveLayerId) {
			if (!feature.properties._id) return;
			setActiveBottomSheet({ entityId: String(feature.properties._id), view: 'alerts-detail' }, { replace: true });
			return;
		}

		if (layerId === MapViewOverlayVehiclesInteractiveLayerId) {
			if (!feature.properties.vehicle_id) return;
			setActiveBottomSheet({ entityId: String(feature.properties.vehicle_id), view: 'vehicles-detail' }, { replace: true });
			return;
		}
	};

	const handleMapDrag = () => {
		setUserLocationTrackingMode('idle');
	};

	//
	// B. Render components

	return (
		<MapView
			id="base-map"
			onClick={handleMapClick}
			onDrag={handleMapDrag}
			interactiveLayerIds={[
				MapViewOverlayVehiclesPrimaryLayerId,
				MapViewOverlayStopsInteractiveLayerId,
				MapViewStyleAlertsInteractiveLayerId,
			]}
		>

			<MapViewOverlayStops
				stopsData={stopsContext.data.fc}
				visible={activeBaseMapOverlays.includes('stops')}
			/>
			<MapViewOverlayStopLineBadges
				visible={activeBaseMapOverlays.includes('stops')}
			/>

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

			{routePlannerContext.data.route_map_data.shapeData.features.length > 0 && (
				<MapViewStylePath
					idPrefix="route-planner"
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={routePlannerContext.data.route_map_data.shapeData}
					waypointsData={routePlannerContext.data.route_map_data.waypointsData}
				/>
			)}

			<MapViewOverlayVehicles
				alwaysShowVehicles={shouldAlwaysShowRoutePlannerVehicles}
				vehiclesData={vehiclesMapData}
				visible={activeBaseMapOverlays.includes('vehicles')}
			/>
			{/* <MapViewOverlayVehicleLineBadges
				visible={activeBaseMapOverlays.includes('vehicles')}
			/> */}

			<MapViewStyleAlerts
				data={alertsMapData}
				visible={activeBaseMapOverlays.includes('alerts')}
			/>
			<MapViewOverlayUserLocation
				latitude={userLocation?.latitude}
				longitude={userLocation?.longitude}
			/>
		</MapView>
	);
}

/* * */

function getRoutePlannerMapFitPadding(viewMode: ReturnType<typeof useRoutePlannerContext>['data']['view_mode']) {
	const viewportHeight = typeof window === 'undefined' ? 0 : window.innerHeight;
	const resultsSheetHeight = viewMode === 'results' ? Math.round(viewportHeight * 0.55) : 0;

	return {
		bottom: Math.max(360, resultsSheetHeight + 32),
		left: 60,
		right: 60,
		top: 120,
	};
}
