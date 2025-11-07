/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
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
					<AppProvider>
						<AppWrapper>
							{children}
						</AppWrapper>
					</AppProvider>
				</NuqsAdapter>
			</AgenciesContextProvider>
		</BaseProvider>
	);
}
