'use client';

import { LinesListToolbar } from '@/components/lines/LinesListToolbar';
import { LinesListViewAll } from '@/components/lines/LinesListViewAll';
import { LinesListViewSkeleton } from '@/components/lines/LinesListViewSkeleton';
import { useLinesListContext } from '@/contexts/LinesList.context';

/* * */

export function LinesList() {
	//

	//
	// A. Setup variables

	const linesContext = useLinesListContext();

	//
	// B. Render components

	return (
		<>
			<LinesListToolbar />
			{linesContext.flags.is_loading && <LinesListViewSkeleton />}
			{(!linesContext.flags.is_loading && linesContext.filters.by_current_view === 'all') && <LinesListViewAll />}
		</>
	);

	//
}
