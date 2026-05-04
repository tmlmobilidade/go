/* * */

import { useUsersListContext } from '@/components/users/list/UsersList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UsersListFilterOrganization() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const usersListContext = useUsersListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={usersListContext.filters.organization_ids.isActive}
			label={t('default:users.list.FilterBar.organization.label')}
			onChange={usersListContext.filters.organization_ids.set}
			options={usersListContext.filters.organization_ids.options}
			withToggleAll
		/>
	);

	//
}
