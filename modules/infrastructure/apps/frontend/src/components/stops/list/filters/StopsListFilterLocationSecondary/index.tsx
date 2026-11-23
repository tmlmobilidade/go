'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterLocationSecondary } from './use-stops-list-filter-location-secondary';

/* * */

export function StopsListFilterLocationSecondary() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterLocationSecondary = useStopsListFilterLocationSecondary();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterLocationSecondary.isActive}
			isLoading={filterLocationSecondary.isLoading}
			label={t('stops:list.StopsListFilterLocationSecondary.label')}
			onChange={filterLocationSecondary.set}
			options={filterLocationSecondary.options}
			isMultiple
			withToggleAll
		/>
	);
}
