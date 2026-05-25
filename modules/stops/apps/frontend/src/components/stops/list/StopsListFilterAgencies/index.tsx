'use client';

import { FilterTypeList, useAgenciesContext, useMeContext } from '@tmlmobilidade/ui';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { getVisibleAgencyIds } from '@/lib/visibleAgencies';
import { useMemo } from 'react';

/* * */

export function StopsListFilterAgencies() {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const stopsListContext = useStopsListContext();
	const meContext = useMeContext();

	const visibleAgencyIds = useMemo(() => {
		return getVisibleAgencyIds(agenciesContext.data.raw, meContext.actions.hasPermissionResource);
	}, [agenciesContext.data.raw, meContext.actions.hasPermissionResource]);

	const visibleOptions = useMemo(() => {
		const visibleIds = new Set(visibleAgencyIds);
		return stopsListContext.filters.agencies.options.filter(option => visibleIds.has(option.value));
	}, [stopsListContext.filters.agencies.options, visibleAgencyIds]);

	//
	// B. Render components

	if (visibleAgencyIds.length <= 1) return null;

	return (
		<FilterTypeList
			active={stopsListContext.filters.agencies.isActive}
			label="Operadores"
			onChange={stopsListContext.filters.agencies.set}
			options={visibleOptions}
			isMultiple
			withToggleAll
		/>
	);

	//
}
