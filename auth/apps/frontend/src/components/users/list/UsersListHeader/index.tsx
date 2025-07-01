/* * */

import { useUsersListContext } from '@/contexts/UsersList.context';
import { Routes } from '@/lib/routes';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Label, Section, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function UsersListHeader() {
	//

	//
	// A. Setup variables

	const userListContext = useUsersListContext();

	//
	// B. Render components

	return (
		<Section alignItems="center" flexDirection="row" gap="sm" justifyContent="space-between" padding="none">
			<Label size="lg" caps>Utilizadores</Label>
			<Spacer />
			<TextInput
				leftSection={<IconSearch size={20} />}
				onChange={e => userListContext.actions.changeSearchQuery(e.target.value)}
				placeholder="Pesquisar..."
				value={userListContext.filters.search_query}
			/>
			<Button
				href={Routes.USER_DETAIL('new')}
				icon={<IconPlus size={20} />}
				label="Novo utilizador"
			/>
		</Section>
	);

	//
}
