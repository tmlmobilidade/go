'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { AlertListItem } from '@/components/alerts/list/AlertsListItem';
import { GroupedListItem } from '@/components/common/lists/GroupedListItem';
import { Accordion } from '@mantine/core';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsListGroup() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return alertsListContext.data.grouped.map(alertGroup => (
		<GroupedListItem key={alertGroup.value} label={t('default:alerts.AlertsListGroup.label', '', { count: alertGroup.items.length })} title={alertGroup.title}>
			<Accordion>
				{alertGroup.items.map(alert => (
					<AlertListItem key={alert._id} alertId={alert._id} searchQuery={alertsListContext.filters.search.value} />
				))}
			</Accordion>
		</GroupedListItem>
	));
}
