/***/

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/***/

export function RidesListFilterTicketingStatus() {
	//

	//

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	return (
		<FilterTypeList
			active={ridesListContext.filters.ticketing_status.isActive}
			label={t('default:list.RidesListFilterTicketingStatus.label')}
			onChange={ridesListContext.filters.ticketing_status.set}
			options={ridesListContext.filters.ticketing_status.options}
			withToggleAll
		/>

	);

	//
}
