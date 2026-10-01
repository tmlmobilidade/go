'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterLifecycleStatus } from './use-stops-list-filter-lifecycle-status';

/* * */

export function StopsListFilterLifecycleStatus() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterLifecycleStatus = useStopsListFilterLifecycleStatus();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterLifecycleStatus.isActive}
			label={t('default:stops.list.FilterLifecycleStatus.label')}
			onChange={filterLifecycleStatus.set}
			options={filterLifecycleStatus.options}
			withToggleAll
		/>
	);
}
