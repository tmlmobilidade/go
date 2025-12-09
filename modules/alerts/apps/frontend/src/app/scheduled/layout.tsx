/* * */

import { AlertCreate } from '@/components/scheduled/create/AlertCreate';
import { AlertList } from '@/components/scheduled/list/AlertsList';
import { AlertCreateContextProvider } from '@/contexts/AlertCreate.context';
import { AlertListContextProvider } from '@/contexts/AlertList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="alerts-scheduled"
			panes={[
				<AlertCreateContextProvider>
					<AlertListContextProvider>
						<AlertList />
					</AlertListContextProvider>
					<AlertCreate />
				</AlertCreateContextProvider>,
				children,
			]}
		/>
	);
}
