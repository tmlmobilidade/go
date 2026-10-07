'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterLocationNeighbourhood } from './use-stops-list-filter-location-neighberhood';

/* * */

export function StopsListFilterLocationNeighbourhood() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterLocationNeighbourhood = useStopsListFilterLocationNeighbourhood();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterLocationNeighbourhood.isActive}
			label={t('default:stops.list.FilterLocationNeighbourhood.label')}
			onChange={filterLocationNeighbourhood.set}
			options={filterLocationNeighbourhood.options}
			isMultiple
			withToggleAll
		/>
	);
}
