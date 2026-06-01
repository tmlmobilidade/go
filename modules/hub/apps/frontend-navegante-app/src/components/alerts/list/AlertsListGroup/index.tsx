'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { AlertListItem } from '@/components/alerts/list/AlertsListItem';
import { GroupedListItem } from '@/components/layout/GroupedListItem';
import { Accordion } from '@mantine/core';
import { Dates } from '@tmlmobilidade/dates';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsListGroup() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertsListContext = useAlertsListContext();

	//
	// B. Transform data

	const allAlertsGroupedByStartDate = useMemo(() => {
		const groupedAlerts = alertsListContext.data.filtered.reduce((result, alert) => {
			if (!alert.active_period_start_date) return result;

			const alertStartDate = Dates.fromUnixTimestamp(alert.active_period_start_date).setZone('Europe/Lisbon', 'offset_only');
			const alertStartDateString = alertStartDate.toFormat('yyyyMMdd');
			const existingGroup = result.find(group => group.value === alertStartDateString);

			if (existingGroup) {
				existingGroup.items.push(alert);
				return result;
			}

			const today = Dates.now('Europe/Lisbon').startOf('day');
			const tomorrow = today.plus({ days: 1 });
			const yesterday = today.minus({ days: 1 });
			const alertStartDateCompare = alertStartDate.startOf('day');
			const formattedDate = alertStartDate.toFormat('d LLLL yyyy', { locale: 'pt-PT' });

			let formattedGroupLabel = '';
			if (alertStartDateCompare.unix_timestamp === today.unix_timestamp) {
				formattedGroupLabel = t('default:alerts.AlertsListGroup.titles.today', '', { value: formattedDate });
			} else if (alertStartDateCompare.unix_timestamp === tomorrow.unix_timestamp) {
				formattedGroupLabel = t('default:alerts.AlertsListGroup.titles.tomorrow', '', { value: formattedDate });
			} else if (alertStartDateCompare.unix_timestamp === yesterday.unix_timestamp) {
				formattedGroupLabel = t('default:alerts.AlertsListGroup.titles.yesterday', '', { value: formattedDate });
			} else if (alertStartDateCompare.unix_timestamp < yesterday.unix_timestamp) {
				formattedGroupLabel = t('default:alerts.AlertsListGroup.titles.past', '', { value: formattedDate });
			} else {
				formattedGroupLabel = t('default:alerts.AlertsListGroup.titles.future', '', { value: formattedDate });
			}

			result.push({
				items: [alert],
				title: formattedGroupLabel,
				value: alertStartDateString,
			});

			return result;
		}, []);

		return groupedAlerts.sort((a, b) => b.value.localeCompare(a.value));
	}, [alertsListContext.data.filtered, t]);
	//
	// C. Render components

	return allAlertsGroupedByStartDate.map(alertGroup => (
		<GroupedListItem key={alertGroup.value} label={t('default:alerts.AlertsListGroup.label', '', { count: alertGroup.items.length })} title={alertGroup.title}>
			<Accordion>
				{alertGroup.items.map(alert => (
					<AlertListItem key={alert._id} alertId={alert._id} />
				))}
			</Accordion>
		</GroupedListItem>
	));
}
