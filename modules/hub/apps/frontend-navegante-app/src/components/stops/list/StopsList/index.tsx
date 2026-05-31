'use client';

import { StopsListContextProvider } from '@/components/stops/list/StopsList.context';
import { StopsListToolbar } from '@/components/stops/list/StopsListToolbar';
import { StopsListView } from '@/components/stops/list/StopsListView';

/* * */

export function StopsList() {
	return (
		<StopsListContextProvider>
			<StopsListToolbar />
			<StopsListView />
		</StopsListContextProvider>
	);
}
