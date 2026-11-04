/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { usePeriodsListFilterAgencies } from '../PeriodsListFilterAgencies/use-periods-list-filter-agencies';

/* * */

export function PeriodsListFilterAgency() {
	//

	//
	// A. Setup variables

	const filter = usePeriodsListFilterAgencies();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListFilter
			active={filter.isActive}
			label={t('default:periods.fields.agency_ids.label')}
			onChange={filter.set}
			options={filter.options}
			withToggleAll
		/>
	);

	//
}
