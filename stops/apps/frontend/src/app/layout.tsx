import '@tmlmobilidade/ui/styles';
import { Routes } from '@/lib/routes';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { cookies as nextCookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { Providers } from './providers';

/* * */

export default async function Layout({
	children,
}: {
	children: React.ReactNode
}) {
	const cookies = await nextCookies();
	const sessionToken = cookies.get('session_token')?.value;

	if (!sessionToken) {
		redirect(
			`${Routes.AUTH_URL}/login?redirect=${encodeURI(Routes.URL)}`,
			RedirectType.replace,
		);
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<AppProvider>
					<Providers>
						<AppWrapper>
							{children}
						</AppWrapper>
					</Providers>
				</AppProvider>
			</body>
		</html>
	);
}
