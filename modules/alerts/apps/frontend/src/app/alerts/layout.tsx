/* * */

import { AlertList } from '@/components/scheduled/list/AlertsList';
import { AlertListContextProvider } from '@/contexts/AlertList.context';
import { PanesManager } from '@go/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="alerts"
			panes={[
				<AlertListContextProvider>
					<AlertList />
				</AlertListContextProvider>,
				children,
			]}
		/>
	);
}
