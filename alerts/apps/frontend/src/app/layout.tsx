/* * */

import '@tmlmobilidade/ui/styles';
import { ConfigProviders } from '@/components/providers/config-providers';
import { DataProviders } from '@/components/providers/data-providers';
import { Routes } from '@/lib/routes';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { cookies as nextCookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

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
			`${Routes.AUTH_API}/login?redirect=${encodeURI(Routes.URL)}`,
			RedirectType.replace,
		);
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<AppProvider>
					<ConfigProviders>
						<DataProviders>
							<AppWrapper>
								{children}
							</AppWrapper>
						</DataProviders>
					</ConfigProviders>
				</AppProvider>
			</body>
		</html>
	);
}
