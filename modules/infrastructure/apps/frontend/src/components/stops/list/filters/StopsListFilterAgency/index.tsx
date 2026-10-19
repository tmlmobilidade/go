'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterAgency } from './use-stops-list-filter-agency';

/* * */

export function StopsListFilterAgency() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterAgency = useStopsListFilterAgency();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterAgency.isActive}
			label={t('default:stops.list.FilterAgency.label')}
			onChange={filterAgency.set}
			options={filterAgency.options}
			isMultiple
			withToggleAll
		/>
	);
}
