/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { ThemeContextProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Ponto de acesso a todos os serviços e aplicações do GO.',
	title: 'GO | Hub',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html>
			<body>
				<ThemeContextProvider>
					<NuqsAdapter>
						{children}
					</NuqsAdapter>
				</ThemeContextProvider>
			</body>
		</html>
	);
}
