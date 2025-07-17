/* * */

import { permissionsConfig } from '@/lib/permissions';
import { Permission } from '@tmlmobilidade/types';

import { PermissionSectionInputProps, PermissionsSection, WithResourceToggle } from '../PermissionSection';

/* * */

export function PermissionSectionGroup({ onResourceToggle, onToggle, permissions }: WithResourceToggle<PermissionSectionInputProps, Permission<unknown>>) {
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
					scope={permission.scope}
					title={permission.title}
				/>
			))}
		</>
	);
}
