/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { ThemeContextProvider } from '@tmlmobilidade/ui';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { PropsWithChildren } from 'react';

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html>
			<body>
				<ThemeContextProvider>
					<NuqsAdapter>
						{children}
					</NuqsAdapter>
				</ThemeContextProvider>
			</body>
		</html>
	);
}
