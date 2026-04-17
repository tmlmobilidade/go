/* * */

import pjson from '#/package.json';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
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
		<BaseProvider version={pjson.version}>
			<AppProvider>
				<AppWrapper>
					{children}
				</AppWrapper>
			</AppProvider>
		</BaseProvider>
	);
}
