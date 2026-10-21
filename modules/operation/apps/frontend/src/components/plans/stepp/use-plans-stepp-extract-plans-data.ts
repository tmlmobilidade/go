'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PlansListFilters, type PlansListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { TemporalStatusValues, type UnixMilliseconds, validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UsePlansSteppExtractPlansDataReturnType {
	data: PlansListItem[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/* * */

export function usePlansSteppExtractPlansData(agencyId: string, startDate: string, endDate: string): UsePlansSteppExtractPlansDataReturnType {
	//

	//
	// A. Setup variables

	const isRangeValid = useMemo(() => {
		try {
			return !!agencyId && !!validateOperationalDate(startDate) && !!validateOperationalDate(endDate) && startDate <= endDate;
		} catch {
			return false;
		}
	}, [agencyId, startDate, endDate]);

	const query = useMemo<PlansListFilters>(() => ({
		agency_ids: [agencyId],
		temporal_statuses: [...TemporalStatusValues],
	}), [agencyId]);

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR(isRangeValid ? [API_ROUTES.operation.PLANS_LIST, query] : null, {
		fetcher: async ([url, query]) => await fetchApiData<PlansListItem[]>({ body: query, method: 'POST', url }),
		refreshInterval: 30_000,
	});

	//
	// C. Transform data

	const eligiblePlans = useMemo(() => {
		if (!isRangeValid) return [];
		return (data?.data ?? []).filter((plan) => {
			if (plan.agency_id !== agencyId || !plan.attachments.operation_gtfs_normalized) return false;
			return plan.active_from <= Number(endDate) && plan.active_until >= Number(startDate);
		});
	}, [agencyId, data?.data, endDate, isRangeValid, startDate]);

	const options = useMemo(() => eligiblePlans.map(plan => ({
		label: `${plan._id} · ${Dates.fromOperationalDateInt(plan.active_from, 'Europe/Lisbon').toFormat('dd/MM/yyyy')} – ${Dates.fromOperationalDateInt(plan.active_until, 'Europe/Lisbon').toFormat('dd/MM/yyyy')}`,
		value: plan._id,
	})), [eligiblePlans]);

	const ids = useMemo(() => eligiblePlans.map(plan => plan._id), [eligiblePlans]);

	//
	// D. Return data

	return useMemo(() => ({
		data: eligiblePlans,
		error: data?.error ?? (error instanceof Error ? error.message : null),
		ids,
		isLoading,
		isValidating,
		options,
		timestamp: data?.timestamp ?? null,
	}), [data?.error, data?.timestamp, eligiblePlans, error, ids, isLoading, isValidating, options]);
}
