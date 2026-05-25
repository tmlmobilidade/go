/* * */

import pjson from '#/package.json';
import { BaseProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

import '@/themes/_reset/reset.css';

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider version={pjson.version}>
			{children}
		</BaseProvider>
	);
}
