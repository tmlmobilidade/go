'use client';

import { AlertsListViewMap } from '@/components/alerts/AlertsListViewMap';
/* * */

import { AlertsCarousel } from '@/components/common/AlertsCarousel';
import { Section } from '@/components/layout/Section';
import { useAlertsContext } from '@/contexts/Alerts.context';
import { DateTime } from 'luxon';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

/* * */

export function AlertsSection() {
	//

	//
	// A. Setup variables

	const t = useTranslations('home.AlertsSection');
	const alertsContext = useAlertsContext();

	//
	// B. Transform data

	const alertsActiveTodayAndTomorrow = useMemo(() => {
		const sortedAlerts = [...alertsContext.data.alerts].sort((a, b) => b.start_date.getTime() - a.start_date.getTime());
		const todayStart = DateTime.now().startOf('day');
		const tomorrowEnd = DateTime.now().plus({ days: 1 }).endOf('day');

		const todayAndTomorrowAlerts = sortedAlerts.filter((alert) => {
			const alertDate = DateTime.fromJSDate(alert.start_date);
			return alertDate >= todayStart && alertDate <= tomorrowEnd;
		});

		if (todayAndTomorrowAlerts.length > 0) {
			return todayAndTomorrowAlerts.slice(0, 5);
		}

		return sortedAlerts.filter(alertsContext.actions.isAlertInThisWeek).slice(0, 5);
	}, [alertsContext.actions.isAlertInThisWeek, alertsContext.data.alerts]);

	//
	// C. Render components

	return (
		<>
			<Section heading={t('section_heading')} href="/alerts">
				<AlertsCarousel alerts={alertsActiveTodayAndTomorrow} />
			</Section>
			<Section>
				<AlertsListViewMap />
			</Section>
		</>
	);

	//
}
