'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesListFilterOrganization } from './use-agencies-list-filter-organization';

/* * */

export function AgenciesListFilterOrganization() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const filterOrganization = useAgenciesListFilterOrganization();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterOrganization.isActive}
			label={t('default:agencies.list.FiltersBar.organizations')}
			onChange={filterOrganization.set}
			options={filterOrganization.options}
			isMultiple
			withToggleAll
		/>
	);
}
