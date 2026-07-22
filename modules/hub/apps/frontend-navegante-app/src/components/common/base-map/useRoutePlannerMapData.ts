'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useLinesContext } from '@/components/lines/Lines.context';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { fetchPatterns } from '@/utils/fetch-patterns';
import { buildRoutePlannerAlertFeatureCollection, filterAlertsByRoutePlannerItinerary, getRoutePlannerItineraryAlertFilters } from '@/utils/route-planner-alerts';
import { getRoutePlannerMapFitFeatures } from '@/utils/route-planner-navigation';
import { getRoutePlannerItineraryRouteDirections, getRoutePlannerItineraryRouteIds, getRoutePlannerRouteDirectionKey, getRoutePlannerRouteIdKey } from '@/utils/route-planner-vehicles';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubPattern, type HubShape } from '@tmlmobilidade/go-types-public-info';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseRoutePlannerMapDataParams {
	activeBottomSheet: ReturnType<typeof useBottomSheet>['activeBottomSheet']
}

/* * */

export function useRoutePlannerMapData({ activeBottomSheet }: UseRoutePlannerMapDataParams) {
	//

	//
	// A. Setup variables

	const alertsContext = useAlertsContext();
	const linesContext = useLinesContext();
	const routePlannerContext = useRoutePlannerContext();

	//
	// B. Fetch data

	const vehicleRouteDirections = useMemo(() => {
		return getRoutePlannerItineraryRouteDirections(routePlannerContext.data.selected_itinerary);
	}, [routePlannerContext.data.selected_itinerary]);

	const routeIds = useMemo(() => {
		return getRoutePlannerItineraryRouteIds(routePlannerContext.data.selected_itinerary);
	}, [routePlannerContext.data.selected_itinerary]);

	const patternIds = useMemo(() => {
		if (!routeIds) return [];

		return Array.from(new Set(
			linesContext.data.routes
				.filter(route => routeIds.has(getRoutePlannerRouteIdKey(route._id, route.agency_id) || ''))
				.flatMap(route => route.pattern_ids),
		));
	}, [linesContext.data.routes, routeIds]);

	const { data: patternGroups } = useSWR<HubPattern[][]>(
		patternIds.length > 0 ? ['route-planner-patterns', ...patternIds] : null,
		() => fetchPatterns(patternIds),
	);

	const patterns = useMemo(() => {
		if (!vehicleRouteDirections || !patternGroups) return [];

		const matchingPatterns = patternGroups
			.flat()
			.filter((candidate) => {
				const routeDirection = getRoutePlannerRouteDirectionKey(candidate.route_id, candidate.direction_id, candidate.agency_id);
				return routeDirection !== null && vehicleRouteDirections.has(routeDirection);
			});

		return Array.from(new Map(matchingPatterns.map(candidate => [candidate.shape_id, candidate])).values());
	}, [patternGroups, vehicleRouteDirections]);

	const shapeIds = useMemo(() => {
		return patterns.map(candidate => candidate.shape_id);
	}, [patterns]);

	const { data: shapes } = useSWR<HubShape[]>(
		shapeIds.length > 0 ? ['route-planner-shapes', ...shapeIds] : null,
		async () => {
			const shapePayloads = await Promise.all(shapeIds.map(async (shapeId) => {
				const response = await fetch(API_ROUTES.hub.NETWORK_SHAPES(shapeId));
				if (!response.ok) return null;

				const payload: HubShape | { data?: HubShape } = await response.json();
				return 'data' in payload ? payload.data ?? null : payload;
			}));

			return shapePayloads.filter((shape): shape is HubShape => shape !== null);
		},
	);

	//
	// C. Transform data

	const alertFilters = useMemo(() => {
		return getRoutePlannerItineraryAlertFilters(routePlannerContext.data.selected_itinerary, linesContext.data.lines);
	}, [linesContext.data.lines, routePlannerContext.data.selected_itinerary]);

	const alerts = useMemo(() => {
		return filterAlertsByRoutePlannerItinerary(alertsContext.data.alerts, alertFilters);
	}, [alertsContext.data.alerts, alertFilters]);

	const alertsMapData = useMemo(() => {
		if (!alertFilters) return alertsContext.data.fc;
		return buildRoutePlannerAlertFeatureCollection(alertsContext.data.fc, alerts, routePlannerContext.data.route_map_data, linesContext.data.lines);
	}, [alertFilters, alerts, alertsContext.data.fc, linesContext.data.lines, routePlannerContext.data.route_map_data]);

	const contextShapeData = useMemo<GeoJSON.FeatureCollection<GeoJSON.LineString>>(() => {
		const shapesById = new Map(shapes?.map(candidate => [candidate._id, candidate]) ?? []);

		return {
			features: patterns.flatMap((pattern) => {
				const shape = shapesById.get(pattern.shape_id);
				if (!shape) return [];

				return [{
					...shape.geojson,
					properties: {
						...shape.geojson.properties,
						color: pattern.color,
						text_color: pattern.text_color,
					},
				}];
			}),
			type: 'FeatureCollection',
		};
	}, [patterns, shapes]);

	const fitFeatures = useMemo(() => {
		return getRoutePlannerMapFitFeatures(routePlannerContext.data.route_map_data.shapeData.features, routePlannerContext.data.view_mode);
	}, [routePlannerContext.data.route_map_data.shapeData.features, routePlannerContext.data.view_mode]);

	const placeDestination = activeBottomSheet?.view === 'routes' && routePlannerContext.data.view_mode === 'place-detail'
		? routePlannerContext.data.destination
		: null;

	//
	// D. Return data

	return {
		alertsMapData,
		contextShapeData,
		fitFeatures,
		placeDestination,
		vehicleRouteDirections,
	};

	//
}
