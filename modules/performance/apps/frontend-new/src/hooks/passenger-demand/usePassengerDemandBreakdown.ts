'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PassengerDemandBreakdown, type PassengerDemandBreakdownDimension } from '@tmlmobilidade/go-types-performance';
import useSWR from 'swr';

import { createPassengerDemandQuery, type PassengerDemandQueryFilters } from './query';

/* * */

interface UsePassengerDemandBreakdownOptions {
	dimension: PassengerDemandBreakdownDimension
	enabled?: boolean
	filters: PassengerDemandQueryFilters
	limit?: number
}

/* * */

export function usePassengerDemandBreakdown({ dimension, enabled = true, filters, limit }: UsePassengerDemandBreakdownOptions) {
	const query = createPassengerDemandQuery(filters);
	query.set('dimension', dimension);
	if (limit !== undefined) query.set('limit', String(limit));
	return useSWR<PassengerDemandBreakdown, Error>(enabled ? `${API_ROUTES.performance.PASSENGER_DEMAND_BREAKDOWN}?${query.toString()}` : null);
}

/* * */
