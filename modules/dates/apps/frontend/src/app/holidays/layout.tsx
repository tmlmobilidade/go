/* * */

import { HolidaysList } from '@/components/holidays/list/HolidaysList';
import { HolidaysListContextProvider } from '@/components/holidays/list/HolidaysList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="holidays"
			panes={[
				<HolidaysListContextProvider>
					<HolidaysList />
				</HolidaysListContextProvider>,
				children,
			]}
		/>
	);
}
