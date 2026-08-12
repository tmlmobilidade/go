/* * */

import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterAgency } from './use-rides-list-filter-agency';

/* * */

export function RidesListFilterAgency() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterAgency = useRidesListFilterAgency();

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
