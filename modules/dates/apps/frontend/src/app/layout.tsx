/* * */

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
		<BaseProvider>
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
