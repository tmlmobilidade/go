'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import AlertsListEmpty from '@/components/alerts/list/AlertsListEmpty';
import { AlertListItem } from '@/components/alerts/list/AlertsListItem';
import { GroupedListItem } from '@/components/layout/GroupedListItem';
import { Accordion } from '@mantine/core';
import { Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsListGroup() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertsListContext = useAlertsListContext();

	//
	// C. Render components

	if (alertsListContext.flags.isLoading) {
		return (
			<Section>
				{/* <GroupedListSkeleton groupCount={3} itemCount={2} itemSkeleton={<AlertsListItemSkeleton />} /> */}
			</Section>
		);
	}

	if (alertsListContext.data.grouped.length > 0) {
		return (
			<Section>
				{alertsListContext.data.grouped.map(alertGroup => (
					<GroupedListItem key={alertGroup.value} label={t('default:alerts.AlertsListToolbar.by_date.current')} title={alertGroup.title}>
						<Accordion>
							{alertGroup.items.map(alert => (
								<AlertListItem key={alert._id} alertId={alert._id} />
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
