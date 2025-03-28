import UserList from '@/components/UserList';
import { UserListContextProvider } from '@/contexts/UserList.context';

export default function UserListPage() {
	return (
		<UserListContextProvider>
			<UserList />
		</UserListContextProvider>
	);
}
