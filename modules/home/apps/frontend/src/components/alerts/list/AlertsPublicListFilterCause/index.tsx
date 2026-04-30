/* * */

import { useAlertsListContext } from '@/contexts/AlertsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterCause() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsListContext.filters.cause.isActive}
			label={t('shared:home.alerts.public.list.filters.cause')}
			onChange={alertsListContext.filters.cause.set}
			options={alertsListContext.filters.cause.options}
			withToggleAll
		/>
	);

	//
}
