'use client';

import { TextFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterCoordinates } from './use-stops-list-filter-coordinates';

/* * */

export function StopsListFilterCoordinates() {
	const { t } = useTranslation();
	const filterCoordinates = useStopsListFilterCoordinates();

	return (
		<TextFilter
			active={filterCoordinates.isActive}
			description={t(filterCoordinates.isInvalid ? 'default:stops.list.FilterCoordinates.invalid' : 'default:stops.list.FilterCoordinates.description')}
			label={t('default:stops.list.FilterCoordinates.label')}
			onChange={filterCoordinates.set}
			placeholder={t('default:stops.list.FilterCoordinates.placeholder')}
			value={filterCoordinates.value}
		/>
	);
}
