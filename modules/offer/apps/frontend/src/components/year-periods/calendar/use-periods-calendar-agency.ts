'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type SelectDataItem, useFilterStateText } from '@tmlmobilidade/ui';
import { useCallback, useMemo } from 'react';

import { usePeriodsAgenciesData } from '../shared/use-periods-agencies-data';

/* * */

interface UsePeriodsCalendarAgencyReturnType {
	error: null | string
	isLoading: boolean
	options: SelectDataItem[]
	set: (value: null | string) => void
	value: null | string
}

/* * */

/** The calendar displays one explicitly chosen operator, independently of the list filter. */
export function usePeriodsCalendarAgency(): UsePeriodsCalendarAgencyReturnType {
	//

	//
	// A. Setup variables

	const filter = useFilterStateText('calendar_agency');
	const { error, ids, isLoading, options } = usePeriodsAgenciesData({
		permissions: { actions: [PermissionCatalog.all.year_periods.actions.read], scope: PermissionCatalog.all.year_periods.scope },
	});
	const value = ids.includes(filter.value) ? filter.value : null;
	const set = useCallback((agencyId: null | string) => filter.set(agencyId ?? ''), [filter.set]);

	//
	// B. Return data

	return useMemo(() => ({
		error,
		isLoading,
		options,
		set,
		value,
	}), [error, isLoading, options, set, value]);
}
