/* * */

import { useUsersListContext } from '@/contexts/UsersList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function UsersListHeader() {
	//

	//
	// A. Setup variables

	const userListContext = useUsersListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Utilizadores</Label>
			<Spacer />
			<SearchInput onChange={userListContext.actions.setFilterSearch} value={userListContext.filters.search} />
			<Button href="/users/new" icon={<IconPlus size={20} />} label="Novo utilizador" />
		</Toolbar>
	);

	//
}
