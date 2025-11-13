/* * */

import { permissionsConfig } from '@/lib/permissions';
import { Permission, Role } from '@tmlmobilidade/types';

import { PermissionSectionInputProps, PermissionsSection, WithResourceToggle } from '../PermissionSection';

/* * */

export function PermissionSectionGroup({
	onResourceToggle,
	onToggle,
	permissions,
	roles,
	userRoleIds,
}: WithResourceToggle<PermissionSectionInputProps, Permission<unknown>> & {
	roles?: Role[]
	userRoleIds?: string[]
}) {
	return (
		<>
			{permissionsConfig.map(permission => (
				<PermissionsSection
					key={permission.scope}
					actions={permission.actions}
					currentPermissions={permissions}
					description={permission.description}
					onResourceToggle={onResourceToggle}
					onToggle={onToggle}
					roles={roles}
					scope={permission.scope}
					title={permission.title}
					userRoleIds={userRoleIds}
				/>
			))}
		</>
	);
}
