'use client';
/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { Switch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterPast() {
	const { t } = useTranslation();
	const { filters } = useAlertsPublicListContext();

	return (
		<Switch
			checked={filters.include_past_alerts}
			label={t('default:alerts.public.list.filters.past_alerts')}
			onChange={e => filters.setIncludePastAlerts(e.currentTarget.checked)}
		/>
	);
}
