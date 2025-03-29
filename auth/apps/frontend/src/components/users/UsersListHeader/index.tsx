/* * */

import { useUsersListContext } from '@/contexts/UsersList.context';
import { Routes } from '@/lib/routes';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Surface, TextInput } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function UsersListHeader() {
	//

	//
	// A. Setup variables

	const userListContext = useUsersListContext();

	//
	// B. Render components

	return (
		<Surface
			alignItems="center"
			classNames={styles}
			flexDirection="row"
			justifyContent="space-between"
			padding="sm"
		>
			<span className={styles.title}>Utilizadores</span>
			<div className={styles.actions}>
				<TextInput
					leftSection={<IconSearch size={20} />}
					miw={400}
					onChange={e => userListContext.actions.changeSearchQuery(e.target.value)}
					placeholder="Pesquisar utilizador"
					value={userListContext.filters.search_query}
				/>
				<Button href={Routes.USER_DETAIL('new')} icon={<IconPlus size={20} />} label="Novo utilizador" />
			</div>
		</Surface>
	);

	//
}
