/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterAcceptanceStatus() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.acceptance_status.isActive}
			label={t('default:list.RidesListFilterAcceptanceStatus.label')}
			onChange={ridesListContext.filters.acceptance_status.set}
			options={ridesListContext.filters.acceptance_status.options}
			withToggleAll
		/>
	);

	//
}
