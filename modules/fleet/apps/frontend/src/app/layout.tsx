/* * */

import pjson from '#/package.json';
import { DataProviders } from '@/providers/data-providers';
import { AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Gestão de frota',
	title: 'GO | Frota',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider module="fleet" version={pjson.version}>
			<DataProviders>
				<AppWrapper>
					{children}
				</AppWrapper>
			</DataProviders>
		</BaseProvider>
	);
}
