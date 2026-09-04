'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PassengerDemandTotal } from '@tmlmobilidade/go-types-performance';
import useSWR from 'swr';

import { createPassengerDemandQuery, type PassengerDemandQueryFilters } from './query';

/* * */

export function usePassengerDemandSummary(filters: PassengerDemandQueryFilters, enabled = true) {
	const query = createPassengerDemandQuery(filters);
	return useSWR<PassengerDemandTotal, Error>(enabled ? `${API_ROUTES.performance.PASSENGER_DEMAND_SUMMARY}?${query.toString()}` : null);
}

/* * */
