'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PassengerDemandProductivity } from '@tmlmobilidade/go-types-performance';
import useSWR from 'swr';

import { createPassengerDemandQuery, type PassengerDemandQueryFilters } from './query';

/* * */

export function usePassengerDemandProductivity(filters: PassengerDemandQueryFilters, enabled = true) {
	const query = createPassengerDemandQuery(filters);
	return useSWR<PassengerDemandProductivity, Error>(enabled ? `${API_ROUTES.performance.PASSENGER_DEMAND_PRODUCTIVITY}?${query.toString()}` : null);
}

/* * */
