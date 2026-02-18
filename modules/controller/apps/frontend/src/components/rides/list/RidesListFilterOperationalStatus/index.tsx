/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterOperationalStatus() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.operational_status.isActive}
			label={t('default:list.RidesListFilterOperationalStatus.label')}
			onChange={ridesListContext.filters.operational_status.set}
			options={ridesListContext.filters.operational_status.options}
			withToggleAll
		/>
	);

	//
}
