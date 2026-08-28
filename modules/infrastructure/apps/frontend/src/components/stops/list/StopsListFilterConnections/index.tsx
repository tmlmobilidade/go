'use client';

import { Translations } from '@/lib/translations';
import { ListFilter } from '@tmlmobilidade/ui';

import { useStopsListFilterConnections } from './use-stops-list-filter-connections';

/* * */

export function StopsListFilterConnections() {
	//

	//
	// A. Setup variables

	const filterConnections = useStopsListFilterConnections();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterConnections.isActive}
			label="Conexões"
			onChange={filterConnections.set}
			options={filterConnections.options.map(option => ({
				...option,
				label: Translations.CONNECTIONS[option.value as keyof typeof Translations.CONNECTIONS],
			}))}
			isMultiple
			withToggleAll
		/>
	);

	//
}
