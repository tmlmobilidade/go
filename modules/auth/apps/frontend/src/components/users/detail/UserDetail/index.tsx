'use client';

import { PermissionSection } from '@/components/permissions/PermissionSection';
import { useUserDetailContext } from '@/components/users/detail/UserDetail.context';
import { UserDetailBasicInfo } from '@/components/users/detail/UserDetailBasicInfo';
import { UserDetailHeader } from '@/components/users/detail/UserDetailHeader';
import { UserDetailRolesAndOrganization } from '@/components/users/detail/UserDetailRolesAndOrganization';
import { permissionsConfig } from '@/lib/permissions';
import { ContextFormController, Pane, useContextFormWatch } from '@tmlmobilidade/ui';

/* * */

export function UserDetail() {
	//

	//
	// A. Setup variables

	const userDetailContext = useUserDetailContext();
	const permissionsValue = useContextFormWatch({ control: userDetailContext.form.instance.control, name: 'permissions' });
	const roleIdsValue = useContextFormWatch({ control: userDetailContext.form.instance.control, name: 'role_ids' });

	//
	// B. Render components

	return (
		<Pane header={[<UserDetailHeader key="header" />]}>
			<UserDetailBasicInfo />
			<UserDetailRolesAndOrganization />
			<ContextFormController
				control={userDetailContext.form.instance.control}
				name="permissions"
				render={() => (
					<>
						{permissionsConfig.map(item => (
							<PermissionSection
								key={item.scope}
								configActions={item.actions}
								description={item.description}
								enabledPermissions={permissionsValue ?? []}
								enabledRoleIds={roleIdsValue}
								onResourceToggle={userDetailContext.actions.handlePermissionResourceToggle}
								onToggle={userDetailContext.actions.handlePermissionToggle}
								scope={item.scope}
								title={item.title}
							/>
						))}
					</>
				)}
			/>

		</Pane>
	);

	//
}
