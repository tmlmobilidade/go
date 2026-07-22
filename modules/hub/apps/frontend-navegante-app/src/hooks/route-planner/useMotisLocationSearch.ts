'use client';

import { useStopsContext } from '@/components/stops/Stops.context';
import { useMotisGeocode } from '@/hooks/search/useMotisGeocode';
import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { mapHubStopToRoutePlannerLocation } from '@/utils/route-planner/planning/locations';
import { routePlannerCoordinateToLocation } from '@/utils/search/motis-geocode';
import { normalizeSearchText } from '@/utils/search/normalize';
import { type HubStop } from '@tmlmobilidade/go-types-public-info';
import { useMemo } from 'react';

/* * */

interface UseMotisLocationSearchResult {
	data: RoutePlannerLocation[]
	error: null | string
	isLoading: boolean
}

/* * */

export function useMotisLocationSearch(query: string): UseMotisLocationSearchResult {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const coordinateLocation = routePlannerCoordinateToLocation(query.trim());
	const localStopResults = useMemo(() => searchStops(stopsContext.data.stops, query), [query, stopsContext.data.stops]);
	const motisSearch = useMotisGeocode(query, {
		enabled: !coordinateLocation,
		errorMessage: 'Erro ao pesquisar localizações',
	});

	//
	// B. Transform data

	const data = coordinateLocation ? [coordinateLocation] : [...localStopResults, ...motisSearch.data];
	const error = localStopResults.length > 0 ? null : motisSearch.error;

	//
	// C. Return values

	return { data, error, isLoading: motisSearch.isLoading };

	//
}

/* * */

function searchStops(stops: HubStop[], query: string): RoutePlannerLocation[] {
	const normalizedQuery = normalizeSearchText(query);
	if (normalizedQuery.length < 2) return [];

	return stops
		.filter(stop => normalizeSearchText(`${stop.name} ${stop.short_name} ${stop.locality_name ?? ''} ${stop.municipality_name}`).includes(normalizedQuery))
		.slice(0, 8)
		.map(stop => mapHubStopToRoutePlannerLocation(stop));
}
