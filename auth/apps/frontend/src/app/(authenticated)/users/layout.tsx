/* * */

import { UsersList } from '@/components/users/list/UsersList';
import { UsersListContextProvider } from '@/contexts/UsersList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			panes={[
				<UsersListContextProvider>
					<UsersList />
				</UsersListContextProvider>,
				children,
			]}
		/>
	);
}
