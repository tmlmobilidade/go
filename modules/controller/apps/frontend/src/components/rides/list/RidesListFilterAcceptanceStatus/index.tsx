/* * */

import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterAcceptanceStatus } from './use-rides-list-filter-acceptance-status';

/* * */

export function RidesListFilterAcceptanceStatus() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterAcceptanceStatus = useRidesListFilterAcceptanceStatus();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filterAcceptanceStatus.isActive}
			label={t('default:list.RidesListFilterAcceptanceStatus.label')}
			onChange={filterAcceptanceStatus.set}
			options={filterAcceptanceStatus.options}
			withToggleAll
		/>
	);
}
