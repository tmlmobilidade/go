/* * */

import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesAgencyFilter } from './use-rides-agency-filter';

/* * */

export function RidesListFilterAgency() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterAgency = useRidesAgencyFilter();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filterAgency.isActive}
			label={t('default:list.RidesListFilterAgency.label')}
			onChange={filterAgency.set}
			options={filterAgency.options}
			isMultiple
			withToggleAll
		/>
	);
}
