/* * */

import { UserCreate } from '@/components/users/create/UserCreate';
import { UsersListIdle } from '@/components/users/list/UsersListIdle/page';
import { UserCreateContextProvider } from '@/contexts/UserCreate.context';

/* * */

export default async function Page() {
	return (
		<>
			<UserCreateContextProvider>
				<UserCreate />
			</UserCreateContextProvider>
			<UsersListIdle />
		</>
	);
}
