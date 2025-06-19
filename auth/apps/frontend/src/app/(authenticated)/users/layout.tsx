import { UsersList } from '@/components/users/list/UsersList';
import { UsersListContextProvider } from '@/contexts/UsersList.context';
import { PanesManager } from '@tmlmobilidade/ui';

export default function Layout({ children }: { children: React.ReactNode }) {
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
