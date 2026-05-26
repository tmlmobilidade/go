'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { Translations } from '@/lib/translations';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function StopsListFilterConnections() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={stopsListContext.filters.connections.isActive}
			label="Conexões"
			onChange={stopsListContext.filters.connections.set}
			options={stopsListContext.filters.connections.options.map(option => ({
				...option,
				label: Translations.CONNECTIONS[option.value as keyof typeof Translations.CONNECTIONS],
			}))}
			isMultiple
			withToggleAll
		/>
	);

	//
}
