'use client';
/* * */

import { useAlertsListContext } from '@/contexts/AlertsList.context';
import { Switch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterPast() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<Switch
			checked={alertsListContext.filters.include_past_alerts}
			label={t('shared:home.alerts.public.list.filters.past_alerts')}
			onChange={e => alertsListContext.filters.setIncludePastAlerts(e.currentTarget.checked)}
		/>
	);

	//
}
