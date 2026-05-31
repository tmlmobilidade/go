'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { StopsListViewList } from '@/components/stops/list/StopsListViewList';
import { StopsListViewMap } from '@/components/stops/list/StopsListViewMap';

/* * */

export function StopsListView() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	if (stopsListContext.view.current === 'list') {
		return <StopsListViewList />;
	} else {
		return (
			<StopsListViewMap />
		);
	}
}
