'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterDistrict } from './use-stops-list-filter-district';

/* * */

export function StopsListFilterDistrict() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterDistrict = useStopsListFilterDistrict();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterDistrict.isActive}
			label={t('default:stops.list.FilterDistrict.label')}
			onChange={filterDistrict.set}
			options={filterDistrict.options}
			isMultiple
			withToggleAll
		/>
	);
}
