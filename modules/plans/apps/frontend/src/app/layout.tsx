/* * */

import { DataProviders } from '@/providers/data-providers';
import ptTranslation from '@/translations/pt.json';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Validação e gestão de Planos.',
	title: 'GO | Planos',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider>
			<AppProvider i18n={[{ namespace: 'plans', pt: ptTranslation }]}>
				<AppWrapper>
					<DataProviders>
						{children}
					</DataProviders>
				</AppWrapper>
			</AppProvider>s
		</BaseProvider>
	);
}
