/* * */

import { i18nNamespaces } from '@/i18n/resources';
import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
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
		<BaseProvider i18n={i18nNamespaces}>
			<AppProvider>
				<NuqsAdapter>
					<DataProviders>
						<AppWrapper>
							{children}
						</AppWrapper>
					</DataProviders>
				</NuqsAdapter>
			</AppProvider>
		</BaseProvider>
	);
}
