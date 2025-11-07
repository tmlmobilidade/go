/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
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
							{children}
						</AppWrapper>
					</DataProviders>
				</NuqsAdapter>
			</AppProvider>
		</BaseProvider>
	);
}
