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
	const { t } = useTranslation('stops', { keyPrefix: 'list.filters' });
	const { t: tTypes } = useTranslation('stops', { keyPrefix: Translations.LIFECYCLE_STATUS });

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
			label: tTypes(item),
			value: item,
		}));
	}, [stopsListContext.filters.lifecycle_status, tTypes]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label={t('lifecycleStatus')}
			onChange={stopsListContext.actions.setFilterLifecycleStatus}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
