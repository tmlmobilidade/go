/* * */

import pjson from '#/package.json';
import { LocaleContextProvider } from '@/contexts/Locale.context';
import { BaseProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

import '@/themes/_reset/reset.css';

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider version={pjson.version}>
			<LocaleContextProvider>
				{children}
			</LocaleContextProvider>
		</BaseProvider>
	);
}
