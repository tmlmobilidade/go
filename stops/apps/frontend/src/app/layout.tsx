/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { DataProviders } from '@/components/providers/data-providers';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Gestão de Paragens.',
	title: 'GO | Paragens',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<NuqsAdapter>
					<DataProviders>
						<AppProvider>
							<AppWrapper>
								{children}
							</AppWrapper>
						</AppProvider>
					</DataProviders>
				</NuqsAdapter>
			</body>
		</html>
	);
}
