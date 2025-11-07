/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { AlertList } from '@/components/scheduled/list/AlertsList';
import { AlertListContextProvider } from '@/contexts/AlertList.context';
import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper, BaseProvider, PanesManager } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Gestor de avisos e alertas ao público.',
	title: 'GO | Alertas',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider>
			<AppProvider>
				<NuqsAdapter>
					<DataProviders>
						<AppWrapper>
							<AlertsLayout>
								{children}
							</AlertsLayout>
						</AppWrapper>
					</DataProviders>
				</NuqsAdapter>
			</AppProvider>
		</BaseProvider>
	);
}

function AlertsLayout({ children }: PropsWithChildren) {
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
