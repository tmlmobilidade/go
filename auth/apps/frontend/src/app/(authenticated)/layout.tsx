/* * */

import { MeContextProvider } from '@/contexts/Me.context';
import { fetchData } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { User } from '@tmlmobilidade/core-types';
import { SidebarItemProps } from '@tmlmobilidade/ui';
import { cookies as nextCookies } from 'next/headers';
import { redirect } from 'next/navigation';

/* * */

interface Props {
	children: React.ReactNode
}

/* * */

export default async function Layout({ children }: Props) {
	//

	const cookies = await nextCookies();
	const session = cookies.get('session_token');

	if (!session) {
		redirect('/login');
	}

	const response = await fetchData(
		Routes.AUTH_API + Routes.ME,
		'GET',
		undefined,
		{
			Cookie: `session_token=${session.value}`,
		},
	);

	const { sidebar, user } = response.data as { sidebar: SidebarItemProps[], user: User };

	return (
		<MeContextProvider initialSidebar={sidebar} initialUser={user}>
			{children}
		</MeContextProvider>
	);

	//
}
