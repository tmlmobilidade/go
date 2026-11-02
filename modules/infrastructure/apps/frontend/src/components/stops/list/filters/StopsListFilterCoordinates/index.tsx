'use client';

import { TextFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterCoordinates } from './use-stops-list-filter-coordinates';

/* * */

export function StopsListFilterCoordinates() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterCoordinates = useStopsListFilterCoordinates();

	//
	// B. Render components

	return (
		<TextFilter
			active={filterCoordinates.isActive}
			description={t(filterCoordinates.isInvalid ? 'stops:list.StopsListFilterCoordinates.invalid' : 'stops:list.StopsListFilterCoordinates.description')}
			label={t('stops:list.StopsListFilterCoordinates.label')}
			onChange={filterCoordinates.set}
			placeholder={t('stops:list.StopsListFilterCoordinates.placeholder')}
			value={filterCoordinates.value}
		/>
	);
}
