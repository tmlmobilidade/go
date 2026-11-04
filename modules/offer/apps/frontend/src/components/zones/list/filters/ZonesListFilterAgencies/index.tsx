/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useZonesListFilterAgencies } from '../ZonesListFilterAgencies/use-zones-list-filter-agencies';

/* * */

export function ZonesListFilterAgencies() {
	//

	//
	// A. Setup variables

	const filter = useZonesListFilterAgencies();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListFilter
			active={filter.isActive}
			label={t('default:zones.fields.agency_ids.label')}
			onChange={filter.set}
			options={filter.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
