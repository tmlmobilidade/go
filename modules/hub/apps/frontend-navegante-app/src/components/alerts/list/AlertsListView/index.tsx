'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { AlertsListViewList } from '@/components/alerts/list/AlertsListViewList';
import { AlertsListViewMap } from '@/components/alerts/list/AlertsListViewMap';

/* * */

export function AlertsListView() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	if (alertsListContext.view.current === 'list') {
		return <AlertsListViewList />;
	} else {
		return (
			<AlertsListViewMap />
		);
	}
}
