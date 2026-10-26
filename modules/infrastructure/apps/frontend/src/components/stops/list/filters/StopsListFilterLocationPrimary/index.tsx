'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterLocationPrimary } from './use-stops-list-filter-location-primary';

/* * */

export function StopsListFilterLocationPrimary() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterLocationPrimary = useStopsListFilterLocationPrimary();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterLocationPrimary.isActive}
			label={t('default:stops.list.FilterLocationPrimary.label')}
			onChange={filterLocationPrimary.set}
			options={filterLocationPrimary.options}
			isMultiple
			withToggleAll
		/>
	);
}
