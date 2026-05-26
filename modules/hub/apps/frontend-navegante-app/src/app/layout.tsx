/* * */

import pjson from '#/package.json';
import { i18nResourceKeysPt } from '@/i18n/resources';
import { DataProviders } from '@/providers/data-providers';
import { BaseProvider, LoadingSection } from '@tmlmobilidade/ui';
import { type PropsWithChildren, Suspense } from 'react';

import '@/styles/navegante/font.css';
import '@/styles/navegante/color.css';

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<Suspense fallback={<LoadingSection fullHeight />}>
			<BaseProvider i18n={{ pt: i18nResourceKeysPt }} version={pjson.version}>
				<DataProviders>
					{children}
				</DataProviders>
			</BaseProvider>
		</Suspense>
	);
}
