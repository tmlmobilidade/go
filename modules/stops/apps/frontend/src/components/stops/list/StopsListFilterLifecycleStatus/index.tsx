'use client';

/* * */

import { useStopsListContext } from '@/contexts/StopsList.context';
import { Translations } from '@/lib/translations';
import { LifecycleStatusSchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopsListFilterLifecycleStatus() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(LifecycleStatusSchema.options) as string[];
		const enabledValues = stopsListContext.filters.lifecycle_status;
		if (defaultValues.length !== enabledValues.length) return true;
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [stopsListContext.filters.lifecycle_status]);

	const parsedOptions = useMemo(() => {
		if (!LifecycleStatusSchema.options?.length) return [];
		return LifecycleStatusSchema.options.map(item => ({
			checked: stopsListContext.filters.lifecycle_status.includes(item),
			label: Translations.LIFECYCLE_STATUS[item],
			value: item,
		}));
	}, [stopsListContext.filters.lifecycle_status]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Estado"
			onChange={stopsListContext.actions.setFilterLifecycleStatus}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
