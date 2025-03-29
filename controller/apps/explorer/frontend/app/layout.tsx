/* * */

import Providers from '@/app/providers';
import { availableFormats } from '@/i18n/config';
import { NavigationProgress } from '@mantine/nprogress';
import { AppProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { cookies as nextCookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type PropsWithChildren } from 'react';

/* * */

import '@mantine/nprogress/styles.css';
import '@tmlmobilidade/ui/styles';
import '@/styles/default.css';

/* * */

export const metadata: Metadata = {
	title: 'GO | Controller',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	//

	//
	// A. Fetch data

	const locale = await getLocale();
	const messages = await getMessages();

	//
	// B. Render components

	const cookies = await nextCookies();
	const sessionToken = cookies.get('session_token')?.value;

	if (!sessionToken) {
		const currentUrl = encodeURI(process.env.NEXT_PUBLIC_URL);
		redirect(`${process.env.NEXT_PUBLIC_AUTH_URL}/login?redirect=${currentUrl}`, RedirectType.replace);
	}

	//
	// C. Render components

	return (
		<html lang={locale}>
			<head>
				<meta content="transparent" name="theme-color" />
			</head>
			<body>
				<NextIntlClientProvider
					formats={availableFormats}
					locale={locale}
					messages={messages}
				>
					<NuqsAdapter>
						<AppProvider>
							<Providers>
								<NavigationProgress size={5} zIndex={10} />
								{children}
							</Providers>
						</AppProvider>
					</NuqsAdapter>
				</NextIntlClientProvider>
			</body>
		</html>
	);

	//
}
