/* * */

import { UserCreate } from '@/components/users/create/UserCreate';
import { UsersList } from '@/components/users/list/UsersList';
import { UserCreateContextProvider } from '@/contexts/UserCreate.context';
import { UsersListContextProvider } from '@/contexts/UsersList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="users"
			panes={[
				<UserCreateContextProvider>
					<UsersListContextProvider>
						<UsersList />
					</UsersListContextProvider>
					<UserCreate />
				</UserCreateContextProvider>,
				children,
			]}
		/>
	);
}
