'use client';

/* * */

import { StopsListToolbar } from '@/components/stops/StopsListToolbar';
import { StopsListViewAll } from '@/components/stops/StopsListViewAll';
import { StopsListViewMap } from '@/components/stops/StopsListViewMap';
import { StopsListViewSkeleton } from '@/components/stops/StopsListViewSkeleton';
import { useStopsListContext } from '@/contexts/StopsList.context';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<>
			<StopsListToolbar />
			{stopsListContext.flags.is_loading && <StopsListViewSkeleton />}
			{(!stopsListContext.flags.is_loading && stopsListContext.filters.by_current_view === 'list') && <StopsListViewAll />}
			{(!stopsListContext.flags.is_loading && stopsListContext.filters.by_current_view === 'map') && <StopsListViewMap />}
		</>
	);

	//
}
