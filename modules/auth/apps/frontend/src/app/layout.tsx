/* * */

import { i18nResourceKeysPt } from '@/i18n/resources';
import { BaseProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import pjson from 'package.json';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Ponto de acesso a todos os serviços e aplicações do GO.',
	title: 'GO | Home',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider i18n={{ pt: i18nResourceKeysPt }} version={pjson.version}>
			{children}
		</BaseProvider>
	);
}
