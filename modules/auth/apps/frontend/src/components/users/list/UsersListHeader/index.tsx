/* * */

import { useUserCreateContext } from '@/contexts/UserCreate.context';
import { useUsersListContext } from '@/contexts/UsersList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function UsersListHeader() {
	//

	//
	// A. Setup variables

	const usersListContext = useUsersListContext();
	const userCreateContext = useUserCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Utilizadores</Label>
			<Spacer />
			<SearchInput onChange={usersListContext.actions.setFilterSearch} value={usersListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label="Novo utilizador" onClick={userCreateContext.modal.open} />
		</Toolbar>
	);

	//
}
