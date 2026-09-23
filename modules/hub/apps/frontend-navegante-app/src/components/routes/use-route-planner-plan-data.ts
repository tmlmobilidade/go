'use client';

import { type RoutePlannerLocation, type RoutePlannerTravelTime } from '@/types/route-planner/models';
import { buildMotisPlanParams } from '@/utils/route-planner/planning/motis-plan-request';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubV1ApiMotisPlanResponse } from '@tmlmobilidade/go-types-hub';
import { type MotisItinerary } from '@tmlmobilidade/go-types-motis';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useCallback, useEffect, useMemo } from 'react';
import useSWRMutation from 'swr/mutation';

/* * */

interface RoutePlanRequest {
	destination: RoutePlannerLocation
	origin: RoutePlannerLocation
	travelTime: RoutePlannerTravelTime
}

interface UseRoutePlannerPlanDataReturnType {
	isLoading: boolean
	itineraries: MotisItinerary[]
	requestPlan: (request: RoutePlanRequest) => Promise<HubV1ApiMotisPlanResponse>
	reset: () => void
}

/* * */

const ROUTE_PLAN_KEY = 'route-planner/plan';

async function requestRoutePlan(_key: string, { arg }: { arg: RoutePlanRequest }): Promise<HubV1ApiMotisPlanResponse> {
	const params = buildMotisPlanParams(arg.origin, arg.destination, arg.travelTime);
	const response = await fetchApiData<HubV1ApiMotisPlanResponse>({
		credentials: 'omit',
		url: `${API_ROUTES.hub.MOTIS_PLAN}?${params.toString()}`,
	});

	if (response.error || !response.data) throw new Error(response.error ?? 'MOTIS plan returned no data');

	return response.data;
}

/* * */

export function useRoutePlannerPlanData(): UseRoutePlannerPlanDataReturnType {
	//

	// A. Fetch data

	const { data, isMutating, reset, trigger } = useSWRMutation<HubV1ApiMotisPlanResponse, Error, string, RoutePlanRequest>(ROUTE_PLAN_KEY, requestRoutePlan, { throwOnError: true });

	// Reset mutation data when the route planner is unmounted.
	useEffect(() => () => reset(), [reset]);

	//
	// B. Transform data

	const itineraries = useMemo(() => data?.itineraries ?? [], [data?.itineraries]);
	const requestPlan = useCallback(async (request: RoutePlanRequest) => await trigger(request), [trigger]);

	//
	// C. Return data

	return useMemo(() => ({
		isLoading: isMutating,
		itineraries,
		requestPlan,
		reset,
	}), [isMutating, itineraries, requestPlan, reset]);

	//
}
