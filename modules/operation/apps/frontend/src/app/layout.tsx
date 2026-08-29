/* * */

import pjson from '#/package.json';
import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Gestão da Operação de Transportes Públicos.',
	title: 'GO | Operação',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider version={pjson.version}>
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
