'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useSchoolsListFilterGrouping } from './use-schools-list-filter-grouping';

/* * */

export function SchoolsListFilterGrouping() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterGrouping = useSchoolsListFilterGrouping();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterGrouping.isActive}
			label={t('schools:list.filters.grouping.label')}
			onChange={filterGrouping.set}
			options={filterGrouping.options}
			isMultiple
			withToggleAll
		/>
	);
}
