/* * */

import pjson from '#/package.json';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Gestão de Oferta.',
	title: 'GO | Oferta',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider module="offer" version={pjson.version}>
			<AppProvider>
				<AppWrapper>
					{children}
				</AppWrapper>
			</AppProvider>
		</BaseProvider>
	);
}
