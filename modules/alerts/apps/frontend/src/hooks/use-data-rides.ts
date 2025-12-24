'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type GetRidesBatchQuery, type Ride, type RideNormalized } from '@tmlmobilidade/types';
import { type SelectDataItem, useDebouncedState } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

export type RidesData = Ride & { stop_ids: string[] };

interface UseDataRidesProps {
	filters?: GetRidesBatchQuery
}

interface UseDataRidesReturnType {
	error: Error | undefined
	isLoading: boolean
	options: SelectDataItem[]
	raw: RideNormalized[]
}

/* * */

export function useDataRides({ filters }: UseDataRidesProps): UseDataRidesReturnType {
	//

	//
	// A. Setup variables

	const [queryStringParams, setQueryStringParams] = useDebouncedState<null | string>(null, 500);

	//
	// B. Fetch data

	const { data: ridesData, error: ridesError, isLoading: ridesLoading } = useSWR<RideNormalized[], Error>(queryStringParams && `${API_ROUTES.alerts.RIDES_LIST}?${queryStringParams}`);

	//
	// C. Transform data

	useEffect(() => {
		if (!filters.date_start || !filters.date_end || !filters.agency_ids?.length) {
			setQueryStringParams(null);
			return;
		}

		const params = {
			agency_ids: filters?.agency_ids,
			date_end: filters?.date_end,
			date_start: filters?.date_start,
			search: filters?.search || undefined,
			/* * */
			acceptance_status: filters?.acceptance_status,
			analysis_ended_at_last_stop_grade: filters?.analysis_ended_at_last_stop_grade,
			analysis_expected_apex_validation_interval: filters?.analysis_expected_apex_validation_interval,
			analysis_simple_three_vehicle_events_grade: filters?.analysis_simple_three_vehicle_events_grade,
			analysis_transaction_sequentiality: filters?.analysis_transaction_sequentiality,
			/* * */
			delay_statuses: filters?.delay_statuses,
			operational_statuses: filters?.operational_statuses,
			/* * */
			line_ids: filters?.line_ids?.length ? filters.line_ids : undefined,
			stop_ids: filters?.stop_ids?.length ? filters.stop_ids : undefined,
		};
		const stringParams: Record<string, string> = Object.fromEntries(
			Object
				.entries(params)
				.filter(([, value]) => value !== undefined)
				.map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)]),
		);
		const result = new URLSearchParams(stringParams).toString();
		console.log(result);
		setQueryStringParams(result);
	}, [
		filters?.search,
		filters?.agency_ids,
		filters?.date_start,
		filters?.date_end,
		filters?.acceptance_status,
		filters?.analysis_ended_at_last_stop_grade,
		filters?.analysis_expected_apex_validation_interval,
		filters?.analysis_simple_three_vehicle_events_grade,
		filters?.analysis_transaction_sequentiality,
		filters?.delay_statuses,
		filters?.operational_statuses,
	]);

	const optionsData = useMemo(() => {
		if (!ridesData) return [];
		return ridesData.map(ride => ({
			label: ride.headsign,
			value: ride.trip_id,
		}));
	}, [ridesData]);

	//
	// D. Return data

	return {
		error: ridesError,
		isLoading: ridesLoading,
		options: optionsData,
		raw: ridesData ?? [],
	};

	//
};
