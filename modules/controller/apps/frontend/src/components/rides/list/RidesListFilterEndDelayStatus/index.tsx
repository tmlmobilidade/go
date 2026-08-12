/* * */

import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterEndDelayStatus } from './use-rides-list-filter-end-delay-status';

/* * */

export function RidesListFilterEndDelayStatus() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterEndDelayStatus = useRidesListFilterEndDelayStatus();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filterEndDelayStatus.isActive}
			label={t('default:list.RidesListFilterEndDelayStatus.label')}
			onChange={filterEndDelayStatus.set}
			options={filterEndDelayStatus.options}
			withToggleAll
		/>
	);
}
