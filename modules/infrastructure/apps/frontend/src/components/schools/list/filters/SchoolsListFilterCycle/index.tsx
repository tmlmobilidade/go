'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useSchoolsListFilterCycle } from './use-schools-list-filter-cycle';

/* * */

export function SchoolsListFilterCycle() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterCycle = useSchoolsListFilterCycle();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterCycle.isActive}
			label={t('schools:list.filters.cycle.label')}
			onChange={filterCycle.set}
			options={filterCycle.options}
			isMultiple
			withToggleAll
		/>
	);
}
