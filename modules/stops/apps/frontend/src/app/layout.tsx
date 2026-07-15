/* * */

import pjson from '#/package.json';
import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Gestão de Paragens.',
	title: 'GO | Paragens',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider module="stops" version={pjson.version}>
			<AppProvider>
				<DataProviders>
					<AppWrapper>
						{children}
					</AppWrapper>
				</DataProviders>
			</AppProvider>
		</BaseProvider>
	);
}
