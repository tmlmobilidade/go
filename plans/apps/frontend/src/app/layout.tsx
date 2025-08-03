/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
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
		<html lang="en" suppressHydrationWarning>
			<body>
				<AgenciesContextProvider>
					<NuqsAdapter>
						<AppProvider>
							<AppWrapper>
								{children}
							</AppWrapper>
						</AppProvider>
					</NuqsAdapter>
				</AgenciesContextProvider>
			</body>
		</html>
	);
}
