'use client';

import { PermissionSection } from '@/components/permissions/PermissionSection';
import { UsersDetailBasicInfo } from '@/components/users/detail/UsersDetailBasicInfo';
import { UsersDetailHeader } from '@/components/users/detail/UsersDetailHeader';
import { UsersDetailOrganizationAndRoles } from '@/components/users/detail/UsersDetailOrganizationAndRoles';
import { permissionsConfig } from '@/lib/permissions';
import { type Permission, PermissionSchema } from '@tmlmobilidade/go-types-permissions';
import { Pane, useStandardFormWatch } from '@tmlmobilidade/ui';

import { useUsersAgenciesData } from '../../shared/use-users-agencies-data';
import { useUsersMunicipalitiesData } from '../../shared/use-users-municipalities-data';
import { useUsersRolesData } from '../../shared/use-users-roles-data';
import { useUsersDetailData } from '../use-users-detail-data';
import { useUsersDetailFormContext } from '../UsersDetailForm.context';

/* * */

export function UsersDetail() {
	//

	//
	// A. Setup variables

	const { data: userData, isLoading } = useUsersDetailData();

	const { capabilities, form } = useUsersDetailFormContext();

	const { options: usersAgenciesOptions } = useUsersAgenciesData();
	const { options: usersMunicipalitiesOptions } = useUsersMunicipalitiesData();
	const { data: usersRolesData } = useUsersRolesData();

	const permissionsValue = useStandardFormWatch({ control: form.control, name: 'permissions' });

	//
	// B. Handle actions

	function handlePermissionToggle(permission: Permission) {
		// Get latest form values
		const latestValues = form.getValues();
		// Check if a permission entry with the same scope and action already exists
		// and if it does, remove it from the form values
		if (latestValues.permissions?.find(p => p.scope === permission.scope && p.action === permission.action)) {
			const updatedPermissions = latestValues.permissions.filter(p => p.scope !== permission.scope || p.action !== permission.action);
			form.setValue('permissions', updatedPermissions, { shouldDirty: true });
			return;
		}
		// If it doesn't exist, add a new permission entry and validate it
		const validatedPermission = PermissionSchema.safeParse(permission);
		if (!validatedPermission.success) return alert('Erro ao adicionar permissão: ' + JSON.stringify(validatedPermission.error));
		form.setValue('permissions', [...latestValues.permissions ?? [], validatedPermission.data], { shouldDirty: true });
	};

	function handlePermissionResourceToggle(permission: Permission) {
		// Get latest form values
		const latestValues = form.getValues();
		// Validate the permission
		const validatedPermission = PermissionSchema.safeParse(permission);
		if (!validatedPermission.success) return alert('Erro ao adicionar permissão: ' + JSON.stringify(validatedPermission.error));
		// Find the permission in the form values
		const permissionIndex = latestValues.permissions?.findIndex(p => p.scope === permission.scope && p.action === permission.action);
		if (permissionIndex === -1) return alert('Permissão não encontrada na lista de permissões');
		// Update the permission with the new resources
		const updatedPermissions = [
			...latestValues.permissions.slice(0, permissionIndex),
			permission,
			...latestValues.permissions.slice(permissionIndex + 1),
		];
		form.setValue('permissions', updatedPermissions, { shouldDirty: true });
	};

	//
	// C. Render components

	return (
		<Pane header={[<UsersDetailHeader key="header" />]} isLoading={isLoading}>
			<UsersDetailBasicInfo />
			<UsersDetailOrganizationAndRoles />
			{permissionsConfig.map(item => (
				<PermissionSection
					key={item.scope}
					agenciesOptions={usersAgenciesOptions}
					configActions={item.actions}
					description={item.description}
					disabled={!capabilities.editEnabled}
					enabledPermissions={permissionsValue}
					enabledRoleIds={userData?.role_ids}
					municipalitiesOptions={usersMunicipalitiesOptions}
					onResourceToggle={handlePermissionResourceToggle}
					onToggle={handlePermissionToggle}
					rolesData={usersRolesData}
					scope={item.scope}
					title={item.title}
				/>
			))}
		</Pane>
	);
}
