/* * */

import pjson from '#/package.json';
import { i18nResourceKeysPt } from '@/i18n/resources';
import { BaseProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

import '@/styles/navegante/font.css';

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider i18n={{ pt: i18nResourceKeysPt }} version={pjson.version}>
			{children}
		</BaseProvider>
	);
}
