/* * */

import { AlertsList } from '@/components/common/list/AlertsList';
import { AlertsListContextProvider } from '@/components/common/list/AlertsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="alerts"
			panes={[
				<AlertsListContextProvider>
					<AlertsList />
				</AlertsListContextProvider>,
				children,
			]}
		/>
	);
}
