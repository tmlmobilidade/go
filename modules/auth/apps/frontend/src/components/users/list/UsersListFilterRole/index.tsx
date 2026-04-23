/* * */

import { useUsersListContext } from '@/components/users/list/UsersList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UsersListFilterRole() {
	//

	//
	// A. Setup variables

	const usersListContext = useUsersListContext();

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={usersListContext.filters.role_ids.isActive}
			label={t('default:users.list.FilterBar.role.label')}
			onChange={usersListContext.filters.role_ids.set}
			options={usersListContext.filters.role_ids.options}
			withToggleAll
		/>
	);

	//
}
