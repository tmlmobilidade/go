/* * */

import { UsersList } from '@/components/users/UsersList';
import { UsersListContextProvider } from '@/contexts/UsersList.context';

/* * */

export default function Page() {
	return (
		<UsersListContextProvider>
			<UsersList />
		</UsersListContextProvider>
	);
}
