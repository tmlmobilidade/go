'use client';

import { LinesListContextProvider } from '@/components/lines/list/LinesList.context';
import { LinesListViewAll } from '@/components/lines/list/LinesListViewAll';

/* * */

export function LinesList() {
	return (
		<LinesListContextProvider>
			<LinesListViewAll />
		</LinesListContextProvider>
	);
}
