'use client';

/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAnnotationsListFilterAgencies } from './use-annotations-list-filter-agencies';

/* * */

export function AnnotationsListFilterAgencies() {
	//

	//
	// A. Setup variables

	const agency = useAnnotationsListFilterAgencies();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListFilter
			active={agency.isActive}
			label={t('default:annotations.list.columns.agency_ids')}
			onChange={agency.set}
			options={agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
