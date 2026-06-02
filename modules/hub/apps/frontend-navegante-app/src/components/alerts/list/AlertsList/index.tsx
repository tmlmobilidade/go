'use client';

import { AlertsListContextProvider } from '@/components/alerts/list/AlertsList.context';
import { AlertsListToolbar } from '@/components/alerts/list/AlertsListToolbar';
import { AlertsListView } from '@/components/alerts/list/AlertsListView';

/* * */

export function AlertsList() {
	//

	//
	// A. Render components

	return (
		<AlertsListContextProvider>
			<AlertsListToolbar />
			<AlertsListView />
		</AlertsListContextProvider>
	);

	//
}
