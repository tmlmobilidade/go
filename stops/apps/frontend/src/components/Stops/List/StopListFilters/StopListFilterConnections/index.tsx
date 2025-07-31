/* * */

import { useStopListContext } from '@/contexts/StopList.context';
import { Translations } from '@/lib/translations';
import { connectionsSchema } from '@tmlmobilidade/types';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterConnections() {
	//

	//
	// A. Setup variables

	const stopListContext = useStopListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(connectionsSchema.options) as string[];
		const enabledValues = stopListContext.filters.connections;

		if (defaultValues.length !== enabledValues.length) return true;

		return !defaultValues.every(item => enabledValues.includes(item));
	}, [stopListContext.filters.connections]);

	/* * */

	const parsedOptions = useMemo(() => {
		if (!connectionsSchema.options?.length) return [];

		return connectionsSchema.options.map(item => ({
			checked: stopListContext.filters.connections.includes(item),
			label: Translations.CONNECTIONS[item],
			value: item,
		}));
	}, [stopListContext.filters.connections]);

	//
	// C. Render components

	return (
		<FilterMenu
			active={isActive}
			label="conexões"
			onChange={stopListContext.actions.setFilterConnections}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
