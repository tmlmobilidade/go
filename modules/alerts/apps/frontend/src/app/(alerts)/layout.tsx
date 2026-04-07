/* * */

import { AlertsList } from '@/components/list/AlertsList';
import { AlertsListContextProvider } from '@/components/list/AlertsList.context';
import { AppProvider, AppWrapper, PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<AppProvider>
			<AppWrapper>
				<PanesManager
					id="alerts"
					panes={[
						<AlertsListContextProvider key="alerts-list">
							<AlertsList />
						</AlertsListContextProvider>,
						children,
					]}
				/>
			</AppWrapper>
		</AppProvider>
	);
}
