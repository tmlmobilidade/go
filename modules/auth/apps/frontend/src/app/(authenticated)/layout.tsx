/* * */

import { DataProviders } from '@/providers/data-providers';
import ptTranslation from '@/translations/pt.json';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<AppProvider i18n={[{ namespace: 'auth', pt: ptTranslation }]}>
			<AppWrapper>
				<DataProviders>
					{children}
				</DataProviders>
			</AppWrapper>
		</AppProvider>
	);
}
