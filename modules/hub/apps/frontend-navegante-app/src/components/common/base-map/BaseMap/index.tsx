'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useMapBottomSheet } from '@/components/common/bottom-sheet/use-map-bottom-sheet';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { useLinesContext } from '@/components/lines/Lines.context';
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
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { fetchPatterns } from '@/utils/fetch-patterns';
import { centerMap } from '@/utils/map.utils';
import { buildRoutePlannerAlertFeatureCollection, filterAlertsByRoutePlannerItinerary, getRoutePlannerItineraryAlertFilters } from '@/utils/route-planner-alerts';
import { filterVehicleFeatureCollectionByPatternIds, filterVehicleFeatureCollectionByRouteDirections, getRoutePlannerItineraryRouteDirections, getRoutePlannerItineraryRouteIds, getRoutePlannerRouteDirectionKey, getRoutePlannerRouteIdKey } from '@/utils/route-planner-vehicles';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubPattern, type HubShape } from '@tmlmobilidade/go-types-public-info';
import { type MapLayerMouseEvent, useMap, type ViewStateChangeEvent } from '@vis.gl/react-maplibre';
import { useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';

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

	const stopsContext = useStopsContext();
	const alertsContext = useAlertsContext();
	const linesDetailContext = useLinesDetailContext();
	const linesContext = useLinesContext();
	const vehiclesContext = useVehiclesContext();
	const routePlannerContext = useRoutePlannerContext();

	const { data: { activeBaseMapOverlays } } = useMapContext();
	const { setUserLocationTrackingMode, userLocation } = useUserLocation();
	const { activeBottomSheet, activeBottomSheetSnap, setActiveBottomSheet } = useBottomSheet();
	const { collapseForMapInteraction, mapPadding, shouldFitMap } = useMapBottomSheet();

	const { 'base-map': baseMap } = useMap();
	const lastRouteMapFitKeyRef = useRef<null | string>(null);

	const focusedAlertId = activeBottomSheet?.view === 'alerts-detail' ? activeBottomSheet.entityId : null;
	const focusedLineShape = activeBottomSheet?.view === 'lines-detail' ? linesDetailContext.data.active_shape?.geojson : null;
	const focusedStopId = activeBottomSheet?.view === 'stops-detail' ? activeBottomSheet.entityId : null;
	const focusedVehicleId = activeBottomSheet?.view === 'vehicles-detail' ? activeBottomSheet.entityId : null;
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

	const routePlannerVehicleRouteDirections = useMemo(() => {
		return getRoutePlannerItineraryRouteDirections(routePlannerContext.data.selected_itinerary);
	}, [routePlannerContext.data.selected_itinerary]);
	const routePlannerRouteIds = useMemo(() => {
		return getRoutePlannerItineraryRouteIds(routePlannerContext.data.selected_itinerary);
	}, [routePlannerContext.data.selected_itinerary]);
	const routePlannerPatternIds = useMemo(() => {
		if (!routePlannerRouteIds) return [];

		return Array.from(new Set(
			linesContext.data.routes
				.filter(route => routePlannerRouteIds.has(getRoutePlannerRouteIdKey(route._id, route.agency_id) || ''))
				.flatMap(route => route.pattern_ids),
		));
	}, [linesContext.data.routes, routePlannerRouteIds]);
	const { data: routePlannerPatternGroups } = useSWR<HubPattern[][]>(
		routePlannerPatternIds.length > 0 ? ['route-planner-patterns', ...routePlannerPatternIds] : null,
		() => fetchPatterns(routePlannerPatternIds),
	);
	const routePlannerPatterns = useMemo(() => {
		if (!routePlannerVehicleRouteDirections || !routePlannerPatternGroups) return [];

		const matchingPatterns = routePlannerPatternGroups
			.flat()
			.filter((candidate) => {
				const routeDirection = getRoutePlannerRouteDirectionKey(candidate.route_id, candidate.direction_id, candidate.agency_id);
				return routeDirection !== null && routePlannerVehicleRouteDirections.has(routeDirection);
			});

		return Array.from(new Map(matchingPatterns.map(candidate => [candidate.shape_id, candidate])).values());
	}, [routePlannerPatternGroups, routePlannerVehicleRouteDirections]);
	const routePlannerShapeIds = useMemo(() => {
		return routePlannerPatterns.map(candidate => candidate.shape_id);
	}, [routePlannerPatterns]);
	const { data: routePlannerShapes } = useSWR<HubShape[]>(
		routePlannerShapeIds.length > 0 ? ['route-planner-shapes', ...routePlannerShapeIds] : null,
		async () => {
			const shapePayloads = await Promise.all(routePlannerShapeIds.map(async (shapeId) => {
				const response = await fetch(API_ROUTES.hub.NETWORK_SHAPES(shapeId));
				if (!response.ok) return null;

				const payload: HubShape | { data?: HubShape } = await response.json();
				return 'data' in payload ? payload.data ?? null : payload;
			}));

			return shapePayloads.filter((shape): shape is HubShape => shape !== null);
		},
	);
	const routePlannerContextShapeData = useMemo<GeoJSON.FeatureCollection<GeoJSON.LineString>>(() => {
		const shapesById = new Map(routePlannerShapes?.map(candidate => [candidate._id, candidate]) ?? []);

		return {
			features: routePlannerPatterns.flatMap((pattern) => {
				const routePlannerShape = shapesById.get(pattern.shape_id);
				if (!routePlannerShape) return [];

				return [{
					...routePlannerShape.geojson,
					properties: {
						...routePlannerShape.geojson.properties,
						color: pattern.color,
						text_color: pattern.text_color,
					},
				}];
			}),
			type: 'FeatureCollection',
		};
	}, [routePlannerPatterns, routePlannerShapes]);

	const lineDetailVehiclePatternIds = useMemo(() => {
		if (activeBottomSheet?.view !== 'lines-detail') return null;
		const activePatternId = linesDetailContext.data.active_pattern?._id;
		return new Set(activePatternId ? [activePatternId] : []);
	}, [activeBottomSheet?.view, linesDetailContext.data.active_pattern?._id]);

	const shouldAlwaysShowFilteredVehicles = routePlannerVehicleRouteDirections !== null || lineDetailVehiclePatternIds !== null;

	const routePlannerVehiclesMapData = useMemo(() => {
		return filterVehicleFeatureCollectionByRouteDirections(vehiclesContext.data.fc, routePlannerVehicleRouteDirections);
	}, [routePlannerVehicleRouteDirections, vehiclesContext.data.fc]);

	const lineDetailVehiclesMapData = useMemo(() => {
		if (lineDetailVehiclePatternIds === null) return routePlannerVehiclesMapData;
		return filterVehicleFeatureCollectionByPatternIds(vehiclesContext.data.fc, lineDetailVehiclePatternIds);
	}, [lineDetailVehiclePatternIds, routePlannerVehiclesMapData, vehiclesContext.data.fc]);

	const routePlannerMapFitFeatures = useMemo(() => {
		return getRoutePlannerMapFitFeatures(routePlannerContext.data.route_map_data.shapeData.features, routePlannerContext.data.view_mode);
	}, [routePlannerContext.data.route_map_data.shapeData.features, routePlannerContext.data.view_mode]);
	const placeDestination = activeBottomSheet?.view === 'routes' && routePlannerContext.data.view_mode === 'place-detail' ? routePlannerContext.data.destination : null;

	const vehiclesMapData = useMemo(() => {
		if (!focusedVehicleId) return lineDetailVehiclesMapData;

		const collection = getBaseGeoJsonFeatureCollection();

		vehiclesContext.data.fc.features.forEach((feature) => {
			if (feature.properties?.vehicle_id === focusedVehicleId) collection.features.push(feature);
		});

		return collection;
	}, [focusedVehicleId, lineDetailVehiclesMapData, vehiclesContext.data.fc]);

	useEffect(() => {
		if (!baseMap || !focusedAlertId || !activeBaseMapOverlays.includes('alerts')) return;

		const focusedFeature = alertsMapData.features.find(
			feature => feature.geometry?.type === 'Point',
		);

		if (!focusedFeature || focusedFeature.geometry?.type !== 'Point') return;

		// moveMap(viewportMap, focusedFeature.geometry.coordinates);
	}, [baseMap, focusedAlertId, alertsMapData.features, activeBaseMapOverlays]);

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
		if (activeBottomSheet?.view !== 'routes') return;
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
	}, [activeBottomSheet?.view, activeBottomSheetSnap.snapPoint, baseMap, mapPadding, routePlannerContext.data.selected_itinerary_index, routePlannerContext.data.view_mode, routePlannerMapFitFeatures, shouldFitMap]);

	//
	// C. Handle actions

	const handleMapClick = (event: MapLayerMouseEvent) => {
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

	const handleMapDrag = (event: ViewStateChangeEvent) => {
		setUserLocationTrackingMode('idle');
		collapseForMapInteraction(event);
	};

	const handleMapZoom = (event: ViewStateChangeEvent) => {
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
			onZoom={handleMapZoom}
		>

			<MapViewOverlayStops
				stopsData={stopsMapData}
				visible={activeBaseMapOverlays.includes('stops')}
			/>
			<MapViewOverlayStopLineBadges
				visible={activeBaseMapOverlays.includes('stops')}
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
			<MapViewOverlayPlaceLocation
				latitude={placeDestination?.lat}
				longitude={placeDestination?.lon}
				visible={Boolean(placeDestination)}
			/>
			<MapViewOverlayUserLocation
				latitude={userLocation?.latitude}
				longitude={userLocation?.longitude}
			/>
		</MapView>
	);
}

function getRoutePlannerMapFitFeatures(features: GeoJSON.Feature<GeoJSON.LineString>[], viewMode: ReturnType<typeof useRoutePlannerContext>['data']['view_mode']) {
	if (viewMode !== 'itinerary-detail') return features;

	return features.slice(0, 1);
}
