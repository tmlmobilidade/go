/* * */

import '@tmlmobilidade/ui/styles';
import { ThemeContextProvider } from '@tmlmobilidade/ui';

/* * */

interface Props {
	children: React.ReactNode
}

/* * */

export default async function Layout({ children }: Props) {
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
