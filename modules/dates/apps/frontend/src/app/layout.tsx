/* * */

import { i18nNamespaces } from '@/i18n/resources';
import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Gestão de datas',
	title: 'GO | Datas',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider i18n={i18nNamespaces}>
			<AppProvider>
				<AppWrapper>
					<DataProviders>
						{children}
					</DataProviders>
				</AppWrapper>
			</AppProvider>
		</BaseProvider>
	);
}
