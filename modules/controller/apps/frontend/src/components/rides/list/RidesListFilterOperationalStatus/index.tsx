/* * */

import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterOperationalStatus } from './use-rides-list-filter-operational-status';

/* * */

export function RidesListFilterOperationalStatus() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterOperationalStatus = useRidesListFilterOperationalStatus();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filterOperationalStatus.isActive}
			label={t('default:list.RidesListFilterOperationalStatus.label')}
			onChange={filterOperationalStatus.set}
			options={filterOperationalStatus.options}
			withToggleAll
		/>
	);
}
