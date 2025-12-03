'use client';

/* * */

import { PermissionSection } from '@/components/permissions/PermissionSection';
import { UsersDetailBasicInfo } from '@/components/users/detail/UsersDetailBasicInfo';
import { UsersDetailHeader } from '@/components/users/detail/UsersDetailHeader';
import { UsersDetailRolesAndOrganization } from '@/components/users/detail/UsersDetailRolesAndOrganization';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { permissionsConfig } from '@/lib/permissions';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function UsersDetail() {
	//

	//
	// A. Setup variables

	const usersDetailContext = useUsersDetailContext();

	//
	// B. Render components

	return (
		<Pane header={[<UsersDetailHeader />]}>
			<UsersDetailBasicInfo />
			<UsersDetailRolesAndOrganization />
			{/* {permissionsConfig.map(item => (
				<PermissionSection
					key={item.scope}
					configActions={item.actions}
					description={item.description}
					enabledPermissions={usersDetailContext.data.form.values.permissions}
					enabledRoleIds={usersDetailContext.data.form.values.role_ids}
					onResourceToggle={usersDetailContext.actions.handlePermissionResourceToggle}
					onToggle={usersDetailContext.actions.handlePermissionToggle}
					scope={item.scope}
					title={item.title}
				/>
			))} */}
		</Pane>
	);

	//
}
