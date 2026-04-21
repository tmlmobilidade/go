/* * */

import { useAlertsListContext } from '@/contexts/AlertsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterEffect() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={alertsListContext.filters.effect.isActive}
			label={t('shared:home.alerts.public.list.filters.effect')}
			onChange={alertsListContext.filters.effect.set}
			options={alertsListContext.filters.effect.options}
			withToggleAll
		/>
	);

	//
}
