'use client';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { Translations } from '@/lib/translations';
import { StopConnectionSchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsListFilterConnections() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();
	const { t } = useTranslation('stops', { keyPrefix: 'list.filters' });
	const { t: tTypes } = useTranslation('stops', { keyPrefix: Translations.CONNECTIONS });

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(StopConnectionSchema.options) as string[];
		const enabledValues = stopsListContext.filters.connections;
		if (defaultValues.length !== enabledValues.length) return true;
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [stopsListContext.filters.connections]);

	const parsedOptions = useMemo(() => {
		if (!StopConnectionSchema.options?.length) return [];
		return StopConnectionSchema.options.map(item => ({
			checked: stopsListContext.filters.connections.includes(item),
			label: tTypes(item),
			value: item,
		}));
	}, [stopsListContext.filters.connections, tTypes]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label={t('connections')}
			onChange={stopsListContext.actions.setFilterConnections}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
