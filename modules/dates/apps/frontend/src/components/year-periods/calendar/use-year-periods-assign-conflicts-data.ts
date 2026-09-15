'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type OperationalDate, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export interface YearPeriodsAssignConflict {
	dates: OperationalDate[]
	yearPeriod: YearPeriod
}

interface CheckConflictsQuery {
	agency_ids: string[]
	dates: OperationalDate[]
	period_id?: string
}

interface CheckConflictsResult {
	conflicts: { dates: OperationalDate[], year_period: YearPeriod }[]
}

interface UseYearPeriodsAssignConflictsDataArgs {
	agencyIds: string[]
	assignmentMode: 'create' | 'existing'
	dates: OperationalDate[]
	yearPeriodId?: string
}

interface UseYearPeriodsAssignConflictsDataReturnType {
	data: YearPeriodsAssignConflict[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch the year periods that conflict with assigning the given dates to the given agencies.
 * Nothing is fetched until the agencies and, for existing periods, the year period are selected.
 * @returns An object containing the conflicts.
 */
export function useYearPeriodsAssignConflictsData({ agencyIds, assignmentMode, dates, yearPeriodId }: UseYearPeriodsAssignConflictsDataArgs): UseYearPeriodsAssignConflictsDataReturnType {
	//

	//
	// A. Setup variables

	const query = useMemo((): CheckConflictsQuery | null => {
		if (!agencyIds.length) return null;
		if (assignmentMode === 'existing' && !yearPeriodId) return null;
		return {
			agency_ids: agencyIds,
			dates,
			period_id: assignmentMode === 'existing' && yearPeriodId ? yearPeriodId : undefined,
		};
	}, [agencyIds, assignmentMode, dates, yearPeriodId]);

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<CheckConflictsResult>>(query ? [API_ROUTES.dates.YEAR_PERIODS_CHECK_CONFLICTS, query] : null, {
		fetcher: async ([url, body]: [string, CheckConflictsQuery]) => await fetchApiData<CheckConflictsResult>({ body, method: 'POST', url }),
	});

	//
	// C. Transform data

	const conflictsData = useMemo(() => {
		return data?.data?.conflicts.map((conflict): YearPeriodsAssignConflict => ({
			dates: conflict.dates,
			yearPeriod: conflict.year_period,
		})) ?? [];
	}, [data?.data]);

	//
	// D. Return data

	return useMemo(() => ({
		data: conflictsData,
		error: data?.error ?? error?.error ?? null,
		isLoading,
		isValidating,
		timestamp: data?.timestamp ?? null,
	}), [conflictsData, data?.error, data?.timestamp, error, isLoading, isValidating]);
};
