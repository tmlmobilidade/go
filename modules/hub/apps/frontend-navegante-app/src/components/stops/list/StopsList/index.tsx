'use client';

import { StopsListContextProvider } from '@/components/stops/list/StopsList.context';
import { StopsListToolbar } from '@/components/stops/list/StopsListToolbar';
import { StopsListViewAll } from '@/components/stops/list/StopsListViewAll';

/* * */

export function StopsList() {
	return (
		<StopsListContextProvider>
			<StopsListToolbar />
			<StopsListViewAll />
		</StopsListContextProvider>
	);
}
