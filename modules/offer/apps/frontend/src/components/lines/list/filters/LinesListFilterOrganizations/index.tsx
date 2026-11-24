'use client';

/* * */

import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function LinesListFilterOrganizations() {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const { filters } = useLinesListContext();

	//
	// B. Render components

	return (
		<ListFilter
			active={filters.organizations.isActive}
			isLoading={filters.organizations.isLoading}
			label={t('lines:list.LinesListFilterOrganizations.organizations')}
			onChange={filters.organizations.set}
			options={filters.organizations.options}
			isMultiple
			withToggleAll
		/>
	);
}
