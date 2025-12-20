/* * */

import { AlertList } from '@/components/scheduled/list/ScheduledList';
import { ScheduledListContextProvider } from '@/components/scheduled/list/ScheduledList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="alerts-scheduled"
			panes={[
				<ScheduledListContextProvider>
					<AlertList />
				</ScheduledListContextProvider>,
				children,
			]}
		/>
	);
}
