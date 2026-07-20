/* * */

import pjson from '#/package.json';
import { i18nResourceKeysEs, i18nResourceKeysPt } from '@/i18n/resources';
import { BaseProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Ponto de acesso a todos os serviços e aplicações do GO.',
	title: 'GO | Home',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider app="frontend" i18n={{ es: i18nResourceKeysEs, pt: i18nResourceKeysPt }} module="core" version={pjson.version}>
			{children}
		</BaseProvider>
	);
}
