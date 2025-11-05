/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { BaseProvider } from '@tmlmobilidade/ui';
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
		<BaseProvider>
			<NuqsAdapter>
				{children}
			</NuqsAdapter>
		</BaseProvider>
	);
}
