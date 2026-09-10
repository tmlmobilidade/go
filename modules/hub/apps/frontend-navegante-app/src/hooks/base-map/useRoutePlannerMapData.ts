'use client';

import { useLinesData } from '@/components/lines/use-lines-data';
import { useRoutesData } from '@/components/lines/use-routes-data';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { buildPatternShapeFeature } from '@/utils/map/pattern-shape';
import { buildRoutePlannerAlertFeatureCollection, filterAlertsByRoutePlannerItinerary, getRoutePlannerItineraryAlertFilters } from '@/utils/route-planner/itinerary/alerts';
import { getRoutePlannerItineraryRouteDirections, getRoutePlannerItineraryRouteIds, getRoutePlannerRouteDirectionKey, getRoutePlannerRouteIdKey } from '@/utils/route-planner/itinerary/vehicles';
import { getRoutePlannerMapFitFeatures } from '@/utils/route-planner/planning/navigation';
import { fetchPatterns } from '@/utils/transit/fetch-patterns';
import { type HubAlert, type HubPattern } from '@tmlmobilidade/go-types-hub';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseRoutePlannerMapDataParams {
	activeBottomSheet: ReturnType<typeof useBottomSheet>['activeBottomSheet']
	alerts: HubAlert[]
	alertsFeatureCollection: GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
}

/* * */

export function useRoutePlannerMapData({ activeBottomSheet, alerts: allAlerts, alertsFeatureCollection }: UseRoutePlannerMapDataParams) {
	//

	//
	// A. Setup variables

	const { data: lines } = useLinesData();
	const { data: routes } = useRoutesData();
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
			routes
				.filter(route => routeIds.has(getRoutePlannerRouteIdKey(route._id, route.agency_id) || ''))
				.flatMap(route => route.pattern_ids),
		));
	}, [routeIds, routes]);

	const { data: patternGroups } = useSWR<HubPattern[][]>(
		patternIds.length > 0 ? ['route-planner-patterns', ...patternIds] : null,
		{ fetcher: () => fetchPatterns(patternIds) },
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

	//
	// C. Transform data

	const alertFilters = useMemo(() => {
		return getRoutePlannerItineraryAlertFilters(routePlannerContext.data.selected_itinerary, lines);
	}, [lines, routePlannerContext.data.selected_itinerary]);

	const alerts = useMemo(() => {
		return filterAlertsByRoutePlannerItinerary(allAlerts, alertFilters);
	}, [alertFilters, allAlerts]);

	const alertsMapData = useMemo(() => {
		if (!alertFilters) return alertsFeatureCollection;
		return buildRoutePlannerAlertFeatureCollection(alertsFeatureCollection, alerts, routePlannerContext.data.route_map_data, lines);
	}, [alertFilters, alerts, alertsFeatureCollection, lines, routePlannerContext.data.route_map_data]);

	const contextShapeData = useMemo<GeoJSON.FeatureCollection<GeoJSON.LineString>>(() => {
		return {
			features: patterns.flatMap((pattern) => {
				const shape = buildPatternShapeFeature(pattern);
				if (!shape) return [];
				return [shape];
			}),
			type: 'FeatureCollection',
		};
	}, [patterns]);

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
