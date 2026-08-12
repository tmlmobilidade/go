/***/

import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterTicketingStatus } from './use-rides-list-filter-ticketing-status';

/***/

export function RidesListFilterTicketingStatus() {
	//

	//

	const { t } = useTranslation();

	const filterTicketingStatus = useRidesListFilterTicketingStatus();

	return (
		<FilterTypeList
			active={filterTicketingStatus.isActive}
			label={t('default:list.RidesListFilterTicketingStatus.label')}
			onChange={filterTicketingStatus.set}
			options={filterTicketingStatus.options}
			withToggleAll
		/>

	);
}
