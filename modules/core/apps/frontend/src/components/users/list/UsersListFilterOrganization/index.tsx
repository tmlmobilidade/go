/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useUsersListFilterOrganization } from './use-users-list-filter-organization';

/* * */

export function UsersListFilterOrganization() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterOrganization = useUsersListFilterOrganization();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterOrganization.isActive}
			label={t('default:users.list.FilterBar.organization.label')}
			onChange={filterOrganization.set}
			options={filterOrganization.options}
			isMultiple
			withToggleAll
		/>
	);
}
