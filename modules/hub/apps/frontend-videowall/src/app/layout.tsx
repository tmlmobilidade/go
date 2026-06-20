/* * */

import '@mantine/core/styles.layer.css';
import '@/styles/reset.css';
import '@/styles/variables.css';

/* * */

import { Providers } from '@/providers/providers';
import { MantineProvider } from '@mantine/core';
import { Inter } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { type PropsWithChildren } from 'react';

/* * */

const inter = Inter({
	display: 'swap',
	subsets: ['latin'],
	variable: '--font-inter',
	weight: ['400', '600', '900'],
});

export const metadata = {
	description: 'Internal Carris Metropolitana dashboard',
	metadataBase: process.env.VERCEL_URL ? new URL(`https://${process.env.VERCEL_URL}`) : new URL(`http://0.0.0.0:${process.env.PORT || 3000}`),
	title: 'CM Videowall',
};

/* * */

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html className={inter.variable}>
			<body>
				<NuqsAdapter>
					<MantineProvider>
						<Providers>
							{children}
						</Providers>
					</MantineProvider>
				</NuqsAdapter>
			</body>
		</html>
	);
}
