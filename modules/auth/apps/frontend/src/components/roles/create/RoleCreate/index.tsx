'use client';

/* * */

import { PermissionSection } from '@/components/permissions/PermissionSection';
import { useRoleCreateContext } from '@/contexts/RoleCreate.context';
import { permissionsConfig } from '@/lib/permissions';
import { FormModal } from '@tmlmobilidade/ui';

import { RoleCreateBasicInfo } from '../RoleCreateBasicInfo';
import { RoleCreateHeader } from '../RoleCreateHeader';

/* * */

export function RoleCreate() {
	//

	//
	// A. Setup variables

	const rolesCreateContext = useRoleCreateContext();

	//
	// B. Render components

	return (
		<FormModal
			header={[<RoleCreateHeader onClose={rolesCreateContext.modal.close} />]}
			isOpen={rolesCreateContext.modal.state}
			onClose={rolesCreateContext.modal.close}
		>
			<RoleCreateBasicInfo />
			{permissionsConfig.map(item => (
				<PermissionSection
					key={item.scope}
					configActions={item.actions}
					description={item.description}
					enabledPermissions={rolesCreateContext.data.form.values.permissions}
					onResourceToggle={rolesCreateContext.actions.handlePermissionResourceToggle}
					onToggle={rolesCreateContext.actions.handlePermissionToggle}
					scope={item.scope}
					title={item.title}
				/>
			))}
		</FormModal>
	);

	//
}
