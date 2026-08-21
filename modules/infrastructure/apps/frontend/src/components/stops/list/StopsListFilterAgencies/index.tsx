'use client';

import { getVisibleAgencyIds } from '@/lib/visibleAgencies';
import { ListFilter, useAgenciesContext, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useStopsListFilterAgencies } from './use-stops-list-filter-agencies';

export function StopsListFilterAgencies() {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const filterAgencies = useStopsListFilterAgencies();
	const meContext = useMeContext();

	const visibleAgencyIds = useMemo(() => {
		return getVisibleAgencyIds(agenciesContext.data.raw, meContext.actions.hasPermissionResource);
	}, [agenciesContext.data.raw, meContext.actions.hasPermissionResource]);

	const visibleOptions = useMemo(() => {
		const visibleIds = new Set(visibleAgencyIds);
		return filterAgencies.options.filter(option => visibleIds.has(option.value));
	}, [filterAgencies.options, visibleAgencyIds]);

	//
	// B. Render components

	if (visibleAgencyIds.length <= 1) return null;

	return (
		<ListFilter
			active={filterAgencies.isActive}
			label="Operadores"
			onChange={filterAgencies.set}
			options={visibleOptions}
			isMultiple
			withToggleAll
		/>
	);

	//
}
