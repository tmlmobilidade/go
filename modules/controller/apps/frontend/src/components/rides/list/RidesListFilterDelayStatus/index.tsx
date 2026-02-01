/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterDelayStatus() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.delay_status.isActive}
			label={t('default:list.RidesListFilterDelayStatus.label')}
			onChange={ridesListContext.filters.delay_status.set}
			options={ridesListContext.filters.delay_status.options}
			withToggleAll
		/>
	);

	//
}
