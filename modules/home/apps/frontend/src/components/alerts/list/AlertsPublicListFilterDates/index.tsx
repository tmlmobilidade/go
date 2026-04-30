'use client';
/* * */

import { useAlertsListContext } from '@/contexts/AlertsList.context';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { FilterTypeDateRange } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterDates() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<FilterTypeDateRange
			active={true}
			endDate={alertsListContext.filters.period_until as UnixTimestamp}
			label={t('shared:home.alerts.public.list.filters.period')}
			onEndDateChange={alertsListContext.filters.setPeriodUntil}
			onStartDateChange={alertsListContext.filters.setPeriodSince}
			startDate={alertsListContext.filters.period_since as UnixTimestamp}
		/>
	);

	//
}
