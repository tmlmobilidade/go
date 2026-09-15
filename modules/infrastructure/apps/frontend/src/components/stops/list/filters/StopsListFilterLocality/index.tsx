'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterLocality } from './use-stops-list-filter-locality';

/* * */

export function StopsListFilterLocality() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterLocality = useStopsListFilterLocality();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterLocality.isActive}
			label={t('default:stops.list.FilterLocality.label')}
			onChange={filterLocality.set}
			options={filterLocality.options}
			isMultiple
			withToggleAll
		/>
	);
}
