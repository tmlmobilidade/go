'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useSchoolsListFilterMunicipality } from './use-schools-list-filter-municipality';

/* * */

export function SchoolsListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterMunicipality = useSchoolsListFilterMunicipality();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterMunicipality.isActive}
			label={t('schools:list.filters.municipality.label')}
			onChange={filterMunicipality.set}
			options={filterMunicipality.options}
			isMultiple
			withToggleAll
		/>
	);
}
