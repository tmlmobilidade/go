/* * */

import { useUsersListContext } from '@/contexts/UsersList.context';
import { Routes } from '@/lib/routes';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Label, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function UsersListHeader() {
	//

	//
	// A. Setup variables

	const userListContext = useUsersListContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps singleLine>Utilizadores</Label>
			<Spacer />
			<TextInput
				leftSection={<IconSearch size={20} />}
				onChange={e => userListContext.actions.setFilterSearch(e.target.value)}
				placeholder="Pesquisar..."
				value={userListContext.filters.search}
			/>
			<Button
				href={Routes.USER_DETAIL('new')}
				icon={<IconPlus size={20} />}
				label="Novo utilizador"
			/>
		</>
	);

	//
}
