'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterConnections } from './use-stops-list-filter-connections';

/* * */

export function StopsListFilterConnections() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterConnections = useStopsListFilterConnections();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterConnections.isActive}
			label={t('default:stops.list.FilterConnections.label')}
			onChange={filterConnections.set}
			options={filterConnections.options}
			isMultiple
			withToggleAll
		/>
	);
}
