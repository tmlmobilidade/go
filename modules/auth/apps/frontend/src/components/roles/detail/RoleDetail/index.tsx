'use client';

/* * */

import { PermissionSection } from '@/components/permissions/PermissionSection';
import { RoleDetailBasicInfo } from '@/components/roles/detail/RoleDetailBasicInfo';
import { RoleDetailHeader } from '@/components/roles/detail/RoleDetailHeader';
import { useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { permissionsConfig } from '@/lib/permissions';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function RoleDetail() {
	//

	//
	// A. Setup variables

	const rolesDetailContext = useRoleDetailContext();

	//
	// B. Render components

	return (
		<Pane header={[<RoleDetailHeader />]}>
			<RoleDetailBasicInfo />
			{permissionsConfig.map(item => (
				<PermissionSection
					key={item.scope}
					configActions={item.actions}
					description={item.description}
					enabledPermissions={rolesDetailContext.data.form.values.permissions}
					onResourceToggle={rolesDetailContext.actions.handlePermissionResourceToggle}
					onToggle={rolesDetailContext.actions.handlePermissionToggle}
					scope={item.scope}
					title={item.title}
				/>
			))}
		</Pane>
	);

	//
}
