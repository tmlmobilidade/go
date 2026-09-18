'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterMunicipality } from './use-stops-list-filter-municipality';

/* * */

export function StopsListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterMunicipality = useStopsListFilterMunicipality();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterMunicipality.isActive}
			label={t('default:stops.list.FilterMunicipality.label')}
			onChange={filterMunicipality.set}
			options={filterMunicipality.options}
			isMultiple
			withToggleAll
		/>
	);
}
