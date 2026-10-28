'use client';

/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useHolidaysListFilterAgencies } from './use-holidays-list-filter-agencies';

/* * */

export function HolidaysListFilterAgencies() {
	//

	//
	// A. Setup variables

	const agency = useHolidaysListFilterAgencies();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListFilter
			active={agency.isActive}
			label={t('default:holidays.list.columns.agency_ids')}
			onChange={agency.set}
			options={agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
