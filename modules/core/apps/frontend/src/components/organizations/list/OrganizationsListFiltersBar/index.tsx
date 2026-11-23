'use client';

import { FiltersBar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { OrganizationsListFilterType } from '../OrganizationsListFilterType';

/* * */

export function OrganizationsListFiltersBar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FiltersBar label={t('organizations:list.OrganizationsListFiltersBar.label')}>
			<OrganizationsListFilterType />
		</FiltersBar>
	);
}
