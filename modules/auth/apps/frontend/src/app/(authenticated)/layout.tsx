/* * */

import { i18nNamespaces } from '@/i18n/resources';
import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<AppProvider i18n={i18nNamespaces}>
			<AppWrapper>
				<DataProviders>
					{children}
				</DataProviders>
			</AppWrapper>
		</AppProvider>
	);
}
