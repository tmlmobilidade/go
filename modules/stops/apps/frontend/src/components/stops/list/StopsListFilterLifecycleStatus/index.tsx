'use client';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { Translations } from '@/lib/translations';
import { LifecycleStatusSchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsListFilterLifecycleStatus() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();
	const { t } = useTranslation();

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
			label: t(Translations.LIFECYCLE_STATUS[item]),
			value: item,
		}));
	}, [stopsListContext.filters.lifecycle_status, t]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label={t('stops:stops.list.FilterBar.FilterLifecycleStatus.label')}
			onChange={stopsListContext.actions.setFilterLifecycleStatus}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
