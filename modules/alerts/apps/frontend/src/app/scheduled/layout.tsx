/* * */

import { AlertList } from '@/components/scheduled/list/AlertsList';
import { AlertsListContextProvider } from '@/components/scheduled/list/AlertsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="alerts-scheduled"
			panes={[
				<AlertsListContextProvider>
					<AlertList />
				</AlertsListContextProvider>,
				children,
			]}
		/>
	);
}
