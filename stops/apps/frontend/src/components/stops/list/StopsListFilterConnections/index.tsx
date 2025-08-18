'use client';

/* * */

import { useStopsListContext } from '@/contexts/StopsList.context';
import { Translations } from '@/lib/translations';
import { connectionsSchema } from '@tmlmobilidade/types';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopsListFilterConnections() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(connectionsSchema.options) as string[];
		const enabledValues = stopsListContext.filters.connections;
		if (defaultValues.length !== enabledValues.length) return true;
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [stopsListContext.filters.connections]);

	const parsedOptions = useMemo(() => {
		if (!connectionsSchema.options?.length) return [];
		return connectionsSchema.options.map(item => ({
			checked: stopsListContext.filters.connections.includes(item),
			label: Translations.CONNECTIONS[item],
			value: item,
		}));
	}, [stopsListContext.filters.connections]);

	//
	// C. Render components

	return (
		<FilterMenu
			active={isActive}
			label="Conexões"
			onChange={stopsListContext.actions.setFilterConnections}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
