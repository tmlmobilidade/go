'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PassengerDemandRecords } from '@tmlmobilidade/go-types-performance';
import useSWR from 'swr';

import { createPassengerDemandQuery, type PassengerDemandQueryFilters } from './query';

/* * */

export function usePassengerDemandRecords(filters: PassengerDemandQueryFilters, enabled = true) {
	const query = createPassengerDemandQuery(filters);
	return useSWR<PassengerDemandRecords, Error>(enabled ? `${API_ROUTES.performance.PASSENGER_DEMAND_RECORDS}?${query.toString()}` : null);
}

/* * */
