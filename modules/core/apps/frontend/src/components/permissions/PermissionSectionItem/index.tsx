'use client';

import { AgencyPermissionMultiselect } from '@/components/permissions/AgencyPermissionMultiselect';
import { AlertReferenceTypePermissionMultiselect } from '@/components/permissions/AlertReferenceTypePermissionMultiselect';
import { PermissionSectionItemCard } from '@/components/permissions/PermissionSectionItemCard';
import { hasRolePermission } from '@/lib/permission-helpers';
import { PermissionConfigAction } from '@/lib/permissions';
import { type Role } from '@tmlmobilidade/go-types-core';
import { type Permission, PermissionSchema } from '@tmlmobilidade/go-types-permissions';
import { Grid, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface PermissionSectionItemProps {
	agenciesOptions: SelectDataItem[]
	configAction: PermissionConfigAction
	disabled?: boolean
	enabledPermissions: Permission[]
	enabledRoleIds?: string[]
	onResourceToggle: (permission: Permission) => void
	onToggle: (permission: Permission) => void
	rolesData: Role	[]
	scope: string
}

/* * */

export function PermissionSectionItem({ agenciesOptions, configAction, disabled, enabledPermissions, enabledRoleIds, onResourceToggle, onToggle, rolesData, scope }: PermissionSectionItemProps) {
	//

	//
	// A. Transform data

	const currentPermissionEntry = enabledPermissions?.find(p => p.scope === scope && p.action === configAction.action);

	const hasPermissionFromRole = useMemo(() => {
		if (!enabledRoleIds || enabledRoleIds.length === 0) return false;
		return hasRolePermission(scope, configAction.action, enabledRoleIds, rolesData);
	}, [scope, configAction.action, enabledRoleIds, rolesData]);

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
		const validatedPermission = PermissionSchema.safeParse({ action: configAction.action, resources: {}, scope });
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
		<PermissionSectionItemCard
			checked={!!currentPermissionEntry || hasPermissionFromRole}
			description={configAction.description}
			disabled={disabled || hasPermissionFromRole}
			footnote={hasPermissionFromRole && 'Permissão Herdada pelo grupo de permissões'}
			label={configAction.label}
			onChange={handleToggle}
		>
			<Grid gap="md">

				{onResourceToggle && configAction.resources?.includes('AGENCIES') && (
					<AgencyPermissionMultiselect
						disabled={disabled || hasPermissionFromRole}
						onChange={(inputValue: string[]) => handleResourceToggle({ agency_ids: inputValue })}
						options={agenciesOptions}
						value={selectedAgencyIds}
					/>
				)}

				{onResourceToggle && configAction.resources?.includes('ALERT_REFERENCE_TYPES') && (
					<AlertReferenceTypePermissionMultiselect
						disabled={disabled || hasPermissionFromRole}
						onChange={(inputValue: string[]) => handleResourceToggle({ reference_types: inputValue })}
						value={selectedAlertReferenceTypeIds}
					/>
				)}

			</Grid>
		</PermissionSectionItemCard>
	);
}
