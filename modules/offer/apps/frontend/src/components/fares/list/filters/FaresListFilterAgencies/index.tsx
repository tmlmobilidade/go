/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useFaresListFilterAgencies } from '../FaresListFilterAgencies/use-fares-list-filter-agencies';

/* * */

export function FaresListFilterAgencies() {
	//

	//
	// A. Setup variables

	const filter = useFaresListFilterAgencies();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListFilter
			active={filter.isActive}
			label={t('default:fares.fields.agency_ids.label')}
			onChange={filter.set}
			options={filter.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
