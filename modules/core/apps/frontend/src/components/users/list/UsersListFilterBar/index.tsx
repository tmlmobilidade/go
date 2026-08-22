/* * */

import { UsersListFilterOrganization } from '@/components/users/list/UsersListFilterOrganization';
import { UsersListFilterRole } from '@/components/users/list/UsersListFilterRole2';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function UsersListFilterBar() {
	return (
		<FiltersBar>
			<UsersListFilterOrganization />
			<UsersListFilterRole />
		</FiltersBar>
	);
}
