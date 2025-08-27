/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Ponto de acesso a todos os serviços e aplicações do GO.',
	title: 'GO | Home',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html>
			<body>
				<NuqsAdapter>
					{children}
				</NuqsAdapter>
			</body>
		</html>
	);
}
