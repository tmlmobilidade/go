/* * */

import '@tmlmobilidade/ui/dist/styles.css';
import { ThemeProvider } from '@tmlmobilidade/ui';
import { Work_Sans } from 'next/font/google';

/* * */

const workSans = Work_Sans({
	subsets: ['latin'],
});

/* * */

interface Props {
	children: React.ReactNode
}

/* * */

export default async function Layout({ children }: Props) {
	return (
		<html>
			<body>
				<ThemeProvider fontFamilyStyle={workSans.style.fontFamily} initialTheme="ocean">
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
