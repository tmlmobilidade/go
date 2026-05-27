'use client';

import { LinesListContextProvider } from '@/components/lines/list/LinesList.context';
import { LinesListToolbar } from '@/components/lines/list/LinesListToolbar';
import { LinesListViewAll } from '@/components/lines/list/LinesListViewAll';

/* * */

export function LinesList() {
	return (
		<LinesListContextProvider>
			<LinesListToolbar />
			<LinesListViewAll />
		</LinesListContextProvider>
	);
}
