/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import ptTranslation from '@/translations/pt.json';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Validação e gestão de Planos de Operação.',
	title: 'GO | Planos',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider>
			<AgenciesContextProvider>
				<NuqsAdapter>
					<AppProvider i18n={[{ namespace: 'plans', pt: ptTranslation }]}>
						<AppWrapper>
							{children}
						</AppWrapper>
					</AppProvider>s
				</NuqsAdapter>
			</AgenciesContextProvider>
		</BaseProvider>
	);
}
