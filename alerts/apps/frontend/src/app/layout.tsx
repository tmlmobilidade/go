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
	description: 'Gestor de avisos e alertas ao público.',
	title: 'GO | Alertas',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider>
			<AppProvider>
				<NuqsAdapter>
					<NotificationsContextProvider>
						<DataProviders>
							<AppWrapper>
								{children}
							</AppWrapper>
						</DataProviders>
					</NotificationsContextProvider>
				</NuqsAdapter>
			</AppProvider>
		</BaseProvider>
	);
}
