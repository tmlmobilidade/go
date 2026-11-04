'use client';

/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useEventsListFilterAgencies } from './use-events-list-filter-agencies';

/* * */

export function EventsListFilterAgencies() {
	//

	//
	// A. Setup variables

	const agency = useEventsListFilterAgencies();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListFilter
			active={agency.isActive}
			label={t('default:events.list.columns.agency_ids')}
			onChange={agency.set}
			options={agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
