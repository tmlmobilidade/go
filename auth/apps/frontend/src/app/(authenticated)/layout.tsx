/* * */

import { AppWrapper, MeContextProvider, useMeContext } from '@tmlmobilidade/ui';
import { cookies as nextCookies } from 'next/headers';
import { redirect } from 'next/navigation';

/* * */

interface Props {
	children: React.ReactNode
}

/* * */

export default async function LayoutContext({ children }: Props) {
	//

	const cookies = await nextCookies();
	const session = cookies.get('session_token');

	if (!session) {
		redirect('/login');
	}

	return (
		<MeContextProvider>
			<AppWrapper>
				{children}
			</AppWrapper>
		</MeContextProvider>
	);

	//
}
