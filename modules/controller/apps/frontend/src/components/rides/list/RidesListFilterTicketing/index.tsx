/***/

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { translateFilterValue } from '@/lib/translations';
import { FilterTypeList } from '@tmlmobilidade/ui';
// import { useTranslation } from 'react-i18next';

/***/

export function RidesListFilterTicketing() {
	//

	//
	// A. Setup variablesa

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			label="Bilhética"
			// active={ridesListContext.filters.ticketing_status.isActive}
			// label={t('default:list.RidesListFilterTicktingStatus.label')}
			// onChange={ridesListContext.filters.ticketing_status.set}
			options={ridesListContext.filters.ticketing_status.options}
			withToggleAll
		/>

	);
}
