'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useOrganizationsListFilterType } from './use-organizations-list-filter-type';

/* * */

export function OrganizationsListFilterType() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const filterType = useOrganizationsListFilterType();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterType.isActive}
			label={t('organizations:list.OrganizationsListFilterType.label')}
			onChange={filterType.set}
			options={filterType.options}
			isMultiple
			withToggleAll
		/>
	);
}
