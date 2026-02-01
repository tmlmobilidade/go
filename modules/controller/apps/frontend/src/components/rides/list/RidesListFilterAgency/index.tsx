/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterAgency() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.agency.isActive}
			label={t('default:list.RidesListFilterAgency.label')}
			onChange={ridesListContext.filters.agency.set}
			options={ridesListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
