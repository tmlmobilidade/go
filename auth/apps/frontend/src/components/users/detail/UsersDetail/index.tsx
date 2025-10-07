'use client';

/* * */

import { PermissionSectionGroup } from '@/components/permissions/PermissionSectionGroup';
import { UsersDetailBasicInfo } from '@/components/users/detail/UsersDetailBasicInfo';
import { UsersDetailHeader } from '@/components/users/detail/UsersDetailHeader';
import { UsersDetailRolesAndOrganization } from '@/components/users/detail/UsersDetailRolesAndOrganization';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function UsersDetail() {
	const { actions, data } = useUsersDetailContext();

	return (
		<Pane header={[<UsersDetailHeader />]}>
			<UsersDetailBasicInfo />
			<UsersDetailRolesAndOrganization />
			<PermissionSectionGroup
				onResourceToggle={actions.handlePermissionResourceToggle}
				onToggle={actions.handlePermissionToggle}
				permissions={data.form.values.permissions}
			/>
		</Pane>
	);
}
