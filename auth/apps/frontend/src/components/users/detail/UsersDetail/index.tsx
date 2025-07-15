'use client';

/* * */

import { UsersDetailBasicInfo } from '@/components/users/detail/UsersDetailBasicInfo';
import { UsersDetailHeader } from '@/components/users/detail/UsersDetailHeader';
import { UsersDetailRoles } from '@/components/users/detail/UsersDetailRoles';
import { Pane } from '@tmlmobilidade/ui';

/* * */

import { PermissionSectionGroup } from '@/components/permissions/components/PermissionSectionGroup';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';

/* * */

export function UsersDetail() {
	const { actions, data } = useUsersDetailContext();

	return (
		<Pane header={[<UsersDetailHeader />]}>
			<UsersDetailBasicInfo />
			<UsersDetailRoles />
			<PermissionSectionGroup
				onResourceToggle={actions.handlePermissionResourceToggle}
				onToggle={actions.handlePermissionToggle}
				permissions={data.form.values.permissions}
			/>
		</Pane>
	);
}
