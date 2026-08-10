'use client';

import { PermissionSection } from '@/components/permissions/PermissionSection';
import { useRoleDetailContext } from '@/components/roles/detail/RoleDetail.context';
import { RoleDetailBasicInfo } from '@/components/roles/detail/RoleDetailBasicInfo';
import { RoleDetailHeader } from '@/components/roles/detail/RoleDetailHeader';
import { permissionsConfig } from '@/lib/permissions';
import { Pane, useContextFormWatch } from '@tmlmobilidade/ui';

/* * */

export function RoleDetail() {
	//

	//
	// A. Setup variables

	const rolesDetailContext = useRoleDetailContext();
	const permissionsValue = useContextFormWatch({ control: rolesDetailContext.form.instance.control, name: 'permissions' });

	//
	// B. Render components

	return (
		<Pane header={[<RoleDetailHeader key="header" />]}>
			<RoleDetailBasicInfo />
			{permissionsConfig.map(item => (
				<PermissionSection
					key={item.scope}
					configActions={item.actions}
					description={item.description}
					enabledPermissions={permissionsValue}
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
