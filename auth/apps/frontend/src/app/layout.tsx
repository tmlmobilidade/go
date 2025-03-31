/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { ThemeContextProvider } from '@tmlmobilidade/ui';
import { PropsWithChildren } from 'react';

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html>
			<body>
				<ThemeContextProvider>
					{children}
				</ThemeContextProvider>
			</body>
		</html>
	);
}
