'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PassengerDemandFiveMinuteTimeGrain, type PassengerDemandSeries } from '@tmlmobilidade/go-types-performance';
import useSWR from 'swr';

import { createPassengerDemandQuery, type PassengerDemandQueryFilters } from './query';

/* * */

interface UsePassengerDemandSeriesOptions {
	enabled?: boolean
	filters: PassengerDemandQueryFilters
	grain: PassengerDemandFiveMinuteTimeGrain
}

/* * */

export function usePassengerDemandSeries({ enabled = true, filters, grain }: UsePassengerDemandSeriesOptions) {
	const query = createPassengerDemandQuery(filters);
	query.set('time_grain', grain);
	return useSWR<PassengerDemandSeries, Error>(enabled ? `${API_ROUTES.performance.PASSENGER_DEMAND_SERIES}?${query.toString()}` : null);
}

/* * */
