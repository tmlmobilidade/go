/* * */

import '@tmlmobilidade/ui/dist/styles.css';
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
