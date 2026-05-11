/* * */

import { RootProviders } from '@/providers/root-providers';
import { Inter } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type PropsWithChildren, Suspense } from 'react';

/* * */

import '@/themes/_reset/reset.css';

/* * */

const inter = Inter({
	display: 'swap',
	subsets: ['latin'],
	variable: '--font-inter',
	weight: ['400', '500', '600', '700', '800'],
});

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html className={inter.variable} lang="pt">
			<head>
				<meta content="transparent" name="theme-color" />
			</head>
			<body>
				<Suspense fallback={<div>Loading...</div>}>
					<NuqsAdapter>
						<RootProviders>
							{children}
						</RootProviders>
					</NuqsAdapter>
				</Suspense>
			</body>
		</html>
	);
}
