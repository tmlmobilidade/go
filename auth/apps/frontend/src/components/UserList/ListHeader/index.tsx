import { useUserListContext } from '@/contexts/UserList.context';
import { Routes } from '@/lib/routes';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Surface, TextInput } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

export default function Header() {
	const { actions: { changeSearchQuery }, filters: { searchQuery } } = useUserListContext();

	return (
		<Surface
			alignItems="center"
			classNames={styles}
			flexDirection="row"
			justifyContent="space-between"
			padding="sm"
		>
			<span className={styles.title}>
				Utilizadores
			</span>
			<div className={styles.actions}>
				<TextInput
					leftSection={<IconSearch size={20} />}
					miw={400}
					onChange={e => changeSearchQuery(e.target.value)}
					placeholder="Pesquisar utilizador"
					value={searchQuery}
				/>
				<Button href={Routes.USER_DETAIL('new')} icon={<IconPlus size={20} />} label="Novo utilizador" />
			</div>
		</Surface>
	);
}
