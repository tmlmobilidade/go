'use client';

import { AlertsListContextProvider } from '@/components/alerts/list/AlertsList.context';
// import { AlertsListGroup } from '@/components/alerts/list/AlertsListGroup';
import { AlertsListToolbar } from '@/components/alerts/list/AlertsListToolbar';
// import { AlertsListViewMap } from '@/components/alerts/list/AlertsListViewMap';

/* * */

export function AlertsList() {
	return (
		<AlertsListContextProvider>
			<AlertsListToolbar />
			{/* <AlertsListViewMap /> */}
			{/* <AlertsListGroup /> */}
		</AlertsListContextProvider>
	);
}
