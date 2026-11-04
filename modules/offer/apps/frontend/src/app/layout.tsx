/* * */

import pjson from '#/package.json';
import { i18nResourceKeysEn, i18nResourceKeysEs, i18nResourceKeysPt } from '@/i18n/resources';
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
		<BaseProvider i18n={{ en: i18nResourceKeysEn, es: i18nResourceKeysEs, pt: i18nResourceKeysPt }} version={pjson.version}>
			<AppProvider>
				<AppWrapper>
					{children}
				</AppWrapper>
			</AppProvider>
		</BaseProvider>
	);
}
