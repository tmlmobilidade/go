'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterLocationTertiary } from './use-stops-list-filter-location-tertiary';

/* * */

export function StopsListFilterLocationTertiary() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterLocationTertiary = useStopsListFilterLocationTertiary();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterLocationTertiary.isActive}
			label={t('default:stops.list.FilterLocationTertiary.label')}
			onChange={filterLocationTertiary.set}
			options={filterLocationTertiary.options}
			isMultiple
			withToggleAll
		/>
	);
}
