/* * */

import { UsersListFilterOrganization } from '@/components/users/list/UsersListFilterOrganization';
import { UsersListFilterRole } from '@/components/users/list/UsersListFilterRole';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function UsersListFilterBar() {
	return (
		<FiltersBar>
			<UsersListFilterRole />
			<UsersListFilterOrganization />
		</FiltersBar>
	);
}
