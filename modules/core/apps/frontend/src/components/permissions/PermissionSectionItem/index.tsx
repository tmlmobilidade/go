'use client';

import { CheckCard } from '@/components/common/CheckCard';
import { AgencyPermissionMultiselect } from '@/components/permissions/AgencyPermissionMultiselect';
import { AlertReferenceTypePermissionMultiselect } from '@/components/permissions/AlertReferenceTypePermissionMultiselect';
import { useRolesContext } from '@/contexts/Roles.context';
import { hasRolePermission } from '@/lib/permission-helpers';
import { PermissionConfigAction } from '@/lib/permissions';
import { type Permission, PermissionSchema } from '@tmlmobilidade/go-types-permissions';
import { Grid } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface PermissionSectionItemProps {
	configAction: PermissionConfigAction
	enabledPermissions: Permission[]
	enabledRoleIds?: string[]
	onResourceToggle: (permission: Permission) => void
	onToggle: (permission: Permission) => void
	scope: string
}

/* * */

export function PermissionSectionItem({ configAction, enabledPermissions, enabledRoleIds, onResourceToggle, onToggle, scope }: PermissionSectionItemProps) {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();

	//
	// B. Transform data

	const currentPermissionEntry = enabledPermissions?.find(p => p.scope === scope && p.action === configAction.action);

	const hasPermissionFromRole = useMemo(() => {
		if (!enabledRoleIds || enabledRoleIds.length === 0) return false;
		return hasRolePermission(scope, configAction.action, enabledRoleIds, rolesContext.data.raw);
	}, [scope, configAction.action, enabledRoleIds, rolesContext.data.raw]);

	const selectedAgencyIds = (() => {
		if (!currentPermissionEntry) return [];
		if (!('resources' in currentPermissionEntry)) return [];
		return currentPermissionEntry.resources['agency_ids'] || [];
	})();

	const selectedAlertReferenceTypeIds = (() => {
		if (!currentPermissionEntry) return [];
		if (!('resources' in currentPermissionEntry)) return [];
		return currentPermissionEntry.resources['reference_types'] || [];
	})();

	//
	// C. Handle actions

	const handleToggle = () => {
		if (hasPermissionFromRole) return;
		const validatedPermission = PermissionSchema.safeParse({ action: configAction.action, scope });
		if (!validatedPermission.success) return alert('Erro ao adicionar permissão: ' + JSON.stringify(validatedPermission.error));
		onToggle(validatedPermission.data);
	};

	const handleResourceToggle = (resource: Record<string, unknown>) => {
		const validatedPermission = PermissionSchema.safeParse({ action: configAction.action, resources: resource, scope });
		if (!validatedPermission.success) return alert('Erro ao adicionar permissão: ' + JSON.stringify(validatedPermission.error));
		onResourceToggle(validatedPermission.data);
	};

	//
	// D. Render components

	return (
		<CheckCard
			checked={!!currentPermissionEntry || hasPermissionFromRole}
			description={configAction.description}
			disabled={hasPermissionFromRole}
			footnote={hasPermissionFromRole && 'Permissão Herdada pelo grupo de permissões'}
			label={configAction.label}
			onChange={handleToggle}
		>
			<Grid gap="md">

				{onResourceToggle && configAction.resources?.includes('AGENCIES') && (
					<AgencyPermissionMultiselect
						disabled={hasPermissionFromRole}
						onChange={(inputValue: string[]) => handleResourceToggle({ agency_ids: inputValue })}
						value={selectedAgencyIds}
					/>
				)}

				{onResourceToggle && configAction.resources?.includes('ALERT_REFERENCE_TYPES') && (
					<AlertReferenceTypePermissionMultiselect
						disabled={hasPermissionFromRole}
						onChange={(inputValue: string[]) => handleResourceToggle({ reference_types: inputValue })}
						value={selectedAlertReferenceTypeIds}
					/>
				)}

			</Grid>
		</CheckCard>
	);

	//
}
