'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import AlertsListEmpty from '@/components/alerts/list/AlertsListEmpty';
import { AlertListItem } from '@/components/alerts/list/AlertsListItem';
import { GroupedListItem } from '@/components/layout/GroupedListItem';
import GroupedListSkeleton from '@/components/layout/GroupedListSkeleton';
import { Accordion } from '@mantine/core';
// import { type AlertGroupByDate } from '@tmlmobilidade/go-hub-pckg-types';
import { Section } from '@tmlmobilidade/ui';
// import { DateTime } from 'luxon';
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
		//
		if (!alertsListContext.data) return [];
		//
		// const groupedAlerts: AlertGroupByDate[] = alertsListContext.data.filtered.reduce((result: AlertGroupByDate[], item) => {
		// 	const alertStartDateObject = DateTime.fromJSDate(item.start_date);
		// 	const alertStartDateString = alertStartDateObject.toFormat('yyyyMMdd');
		// 	const existingGroup = result.find(group => group.value === alertStartDateString);
		// 	if (existingGroup) {
		// 		existingGroup.items.push(item);
		// 	} else {
		// 		let formattedGroupLabel = '';
		// 		const today = DateTime.local().startOf('day');
		// 		const alertStartDateObjectCompare = alertStartDateObject.startOf('day');
		// 		if (alertStartDateObjectCompare.equals(today)) {
		// 			formattedGroupLabel = t('titles.today', { value: alertStartDateObject.toJSDate() });
		// 		} else if (alertStartDateObjectCompare.equals(today.plus({ days: 1 }))) {
		// 			formattedGroupLabel = t('titles.tomorrow', { value: alertStartDateObject.toJSDate() });
		// 		} else if (alertStartDateObjectCompare.equals(today.minus({ days: 1 }))) {
		// 			formattedGroupLabel = t('titles.yesterday', { value: alertStartDateObject.toJSDate() });
		// 		} else if (alertStartDateObjectCompare < today.minus({ days: 1 })) {
		// 			formattedGroupLabel = t('titles.past', { value: alertStartDateObject.toJSDate() });
		// 		} else {
		// 			formattedGroupLabel = t('titles.future', { value: alertStartDateObject.toJSDate() });
		// 		}
		// 		result.push({
		// 			items: [item],
		// 			title: formattedGroupLabel,
		// 			value: alertStartDateString,
		// 		});
		// 	}
		// 	return result;
		// }, []) || [];
		//
		// const sortedGroups = groupedAlerts.sort((a, b) => collator.compare(b.value, a.value));
		//
		return []; // sortedGroups;
		//
	}, [alertsListContext.data]);

	//
	// C. Render components

	if (alertsListContext.flags.is_loading) {
		return (
			<Section>
				{/* <GroupedListSkeleton groupCount={3} itemCount={2} itemSkeleton={<AlertsListItemSkeleton />} /> */}
			</Section>
		);
	}

	if (allAlertsGroupedByStartDate.length > 0) {
		return (
			<Section>
				{allAlertsGroupedByStartDate.map(alertGroup => (
					<GroupedListItem key={alertGroup.value} label={t('default:alerts.AlertsListToolbar.by_date.current')} title={alertGroup.title}>
						<Accordion>
							{alertGroup.items.map(alert => (
								<AlertListItem key={alert.alert_id} alertId={alert.alert_id} />
							))}
						</Accordion>
					</GroupedListItem>
				))}
			</Section>
		);
	}

	return (
		<Section>
			<AlertsListEmpty />
		</Section>
	);

	//
}
