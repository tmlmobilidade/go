'use client';
/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { FilterTypeDateRange } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterDates() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { filters } = useAlertsPublicListContext();

	//
	// B. Render components

	return (
		<FilterTypeDateRange
			active={true}
			endDate={filters.period_until as UnixTimestamp}
			label={t('shared:base.alerts.public.list.filters.period')}
			onEndDateChange={filters.setPeriodUntil}
			onStartDateChange={filters.setPeriodSince}
			startDate={filters.period_since as UnixTimestamp}
		/>
	);

	//
}
