/* * */

import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterDelayStatus } from './use-rides-list-filter-delay-status';

/* * */

export function RidesListFilterDelayStatus() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterDelayStatus = useRidesListFilterDelayStatus();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filterDelayStatus.isActive}
			label={t('default:list.RidesListFilterDelayStatus.label')}
			onChange={filterDelayStatus.set}
			options={filterDelayStatus.options}
			withToggleAll
		/>
	);
}
