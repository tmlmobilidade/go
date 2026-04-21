/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterCause() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertsPublicListContext = useAlertsPublicListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsPublicListContext.filters.cause.isActive}
			label={t('shared:home.alerts.public.list.filters.cause')}
			onChange={alertsPublicListContext.filters.cause.set}
			options={alertsPublicListContext.filters.cause.options}
			withToggleAll
		/>
	);

	//
}
