'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterFacilities } from './use-stops-list-filter-facilities';

/* * */

export function StopsListFilterFacilities() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterFacilities = useStopsListFilterFacilities();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterFacilities.isActive}
			label={t('default:stops.list.FilterFacilities.label')}
			onChange={filterFacilities.set}
			options={filterFacilities.options}
			withToggleAll
		/>
	);
}
