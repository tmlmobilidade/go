/* * */

import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Gestão de datas',
	title: 'GO | Datas',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider>
			<DataProviders>
				<NuqsAdapter>
					<AppProvider>
						<AppWrapper>
							{children}
						</AppWrapper>
					</AppProvider>
				</NuqsAdapter>
			</DataProviders>
		</BaseProvider>
	);
}
