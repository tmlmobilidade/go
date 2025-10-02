/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper, BaseProvider, NotificationsContextProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Monitorização de circulações em tempo real.',
	title: 'GO | Monitorização',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider>
			<AppProvider>
				<NotificationsContextProvider>
					<NuqsAdapter>
						<DataProviders>
							<AppWrapper>
								{children}
							</AppWrapper>
						</DataProviders>
					</NuqsAdapter>
				</NotificationsContextProvider>
			</AppProvider>
		</BaseProvider>
	);
}
