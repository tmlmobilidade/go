'use client';

/* * */

import { PermissionSection } from '@/components/permissions/PermissionSection';
import { UserDetailBasicInfo } from '@/components/users/detail/UserDetailBasicInfo';
import { UserDetailHeader } from '@/components/users/detail/UserDetailHeader';
import { UserDetailRolesAndOrganization } from '@/components/users/detail/UserDetailRolesAndOrganization';
import { useUserDetailContext } from '@/contexts/UserDetail.context';
import { permissionsConfig } from '@/lib/permissions';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function UserDetail() {
	//

	//
	// A. Setup variables

	const userDetailContext = useUserDetailContext();

	//
	// B. Render components

	return (
		<Pane header={[<UserDetailHeader />]}>
			<UserDetailBasicInfo />
			<UserDetailRolesAndOrganization />
			{permissionsConfig.map(item => (
				<PermissionSection
					key={item.scope}
					configActions={item.actions}
					description={item.description}
					enabledPermissions={userDetailContext.data.form.values.permissions}
					enabledRoleIds={userDetailContext.data.form.values.role_ids}
					onResourceToggle={userDetailContext.actions.handlePermissionResourceToggle}
					onToggle={userDetailContext.actions.handlePermissionToggle}
					scope={item.scope}
					title={item.title}
				/>
			))}
		</Pane>
	);

	//
}
