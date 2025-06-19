/* * */

import { AgencyListContextProvider } from '@/contexts/AgencyList.context';
import { RoleListContextProvider } from '@/contexts/RoleList.context';
import { AppWrapper, MeContextProvider } from '@tmlmobilidade/ui';
import { cookies as nextCookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const cookies = await nextCookies();
	const session = cookies.get('session_token');

	//
	// B. Handle actions

	if (!session) {
		redirect('/login');
	}

	//
	// C. Render components

	return (
		<MeContextProvider>
			<AppWrapper>
				<RoleListContextProvider>
					<AgencyListContextProvider>
						{children}
					</AgencyListContextProvider>
				</RoleListContextProvider>
			</AppWrapper>
		</MeContextProvider>
	);

	//
}
