'use client';

import { FiltersBar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { AgenciesListFilterOrganization } from '../AgenciesListFilterOrganization';

/* * */

export function AgenciesListFiltersBar() {
	const { t } = useTranslation();

	return (
		<FiltersBar label={t('default:agencies.list.FiltersBar.label')}>
			<AgenciesListFilterOrganization />
		</FiltersBar>
	);
}
