/* * */

import pjson from '#/package.json';
import { BaseProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Base',
	title: 'GO | Base',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider version={pjson.version}>
			{children}
		</BaseProvider>
	);
}
