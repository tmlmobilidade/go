/* * */

import { useUserCreateContext } from '@/contexts/UserCreate.context';
import { useUsersListContext } from '@/contexts/UsersList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UsersListHeader() {
	//

	//
	// A. Setup variables
	const t = useTranslation('auth', { keyPrefix: 'users.list.header' }).t;

	const usersListContext = useUsersListContext();
	const userCreateContext = useUserCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('title')}</Label>
			<Spacer />
			<SearchInput onChange={usersListContext.actions.setFilterSearch} value={usersListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label={t('new_user_button_label')} onClick={userCreateContext.modal.open} />
		</Toolbar>
	);

	//
}
