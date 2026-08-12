/* * */

import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterStartDelayStatus } from './use-rides-list-filter-start-delay-status';

/* * */

export function RidesListFilterStartDelayStatus() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterStartDelayStatus = useRidesListFilterStartDelayStatus();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filterStartDelayStatus.isActive}
			label={t('default:list.RidesListFilterStartDelayStatus.label')}
			onChange={filterStartDelayStatus.set}
			options={filterStartDelayStatus.options}
			withToggleAll
		/>
	);
}
