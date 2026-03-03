/* * */

import { AlertsList } from '@/components/list/AlertsList';
import { AlertsListContextProvider } from '@/components/list/AlertsList.context';
import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper, PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<AppProvider>
			<DataProviders>
				<AppWrapper>
					<PanesManager
						id="alerts"
						panes={[
							<AlertsListContextProvider>
								<AlertsList />
							</AlertsListContextProvider>,
							children,
						]}
					/>
				</AppWrapper>
			</DataProviders>
		</AppProvider>
	);
}
