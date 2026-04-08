/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { Dates } from '@tmlmobilidade/dates';
import { FilterTypeDateRange } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterDates() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertsPublicListContext = useAlertsPublicListContext();

	const defaultSince = useMemo(() => Dates.now('Europe/Lisbon').startOf('day').unix_timestamp, []);
	const defaultUntil = useMemo(() => Dates.now('Europe/Lisbon').plus({ years: 1 }).endOf('day').unix_timestamp, []);

	//
	// B. Render components

	return (
		<FilterTypeDateRange
			active={alertsPublicListContext.filters.since !== defaultSince || alertsPublicListContext.filters.until !== defaultUntil}
			endDate={alertsPublicListContext.filters.until}
			label={t('default:alerts.public.list.filters.date_range')}
			onEndDateChange={alertsPublicListContext.filters.setUntil}
			onStartDateChange={alertsPublicListContext.filters.setSince}
			startDate={alertsPublicListContext.filters.since}
		/>
	);

	//
}
