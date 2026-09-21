'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterParish } from './use-stops-list-filter-parish';

/* * */

export function StopsListFilterParish() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterParish = useStopsListFilterParish();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterParish.isActive}
			label={t('default:stops.list.FilterParish.label')}
			onChange={filterParish.set}
			options={filterParish.options}
			isMultiple
			withToggleAll
		/>
	);
}
