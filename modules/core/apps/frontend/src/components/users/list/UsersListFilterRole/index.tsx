/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useUsersListFilterRole } from './use-users-list-filter-role';

/* * */

export function UsersListFilterRole() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterRole = useUsersListFilterRole();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterRole.isActive}
			label={t('default:users.list.FilterBar.role.label')}
			onChange={filterRole.set}
			options={filterRole.options}
			isMultiple
			withToggleAll
		/>
	);
}
