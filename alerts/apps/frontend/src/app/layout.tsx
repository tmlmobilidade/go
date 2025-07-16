/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { DataProviders } from '@/components/providers/data-providers';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { PropsWithChildren } from 'react';

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	//

	//
	// C. Render components

	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<AppProvider>
					<DataProviders>
						<NuqsAdapter>
							<AppWrapper>
								{children}
							</AppWrapper>
						</NuqsAdapter>
					</DataProviders>
				</AppProvider>
			</body>
		</html>
	);

	//
}
