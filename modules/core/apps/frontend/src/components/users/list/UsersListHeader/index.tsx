/* * */

import { openCreateUserModal } from '@/components/users/create/UsersCreate.modal';
import { useUsersListContext } from '@/components/users/list/UsersList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchField, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UsersListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const usersListContext = useUsersListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('default:users.list.Header.title')}</Label>
			<Spacer />
			<SearchField onChange={usersListContext.filters.search.set} value={usersListContext.filters.search.value} />
			<Button icon={<IconPlus size={20} />} label={t('default:users.list.Header.NewUserButton.label')} onClick={openCreateUserModal} />
		</Toolbar>
	);

	//
}
