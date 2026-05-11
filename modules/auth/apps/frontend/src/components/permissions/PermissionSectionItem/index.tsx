'use client';

import { CheckCard } from '@/components/common/CheckCard';
import { AgencyPermissionMultiselect } from '@/components/permissions/AgencyPermissionMultiselect';
import { AlertReferenceTypePermissionMultiselect } from '@/components/permissions/AlertReferenceTypePermissionMultiselect';
import { useRolesContext } from '@/contexts/Roles.context';
import { hasRolePermission } from '@/lib/permission-helpers';
import { PermissionConfigAction } from '@/lib/permissions';
import { type Permission } from '@tmlmobilidade/types';
import { Grid } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface PermissionSectionItemProps {
	configAction: PermissionConfigAction
	enabledPermissions: Permission[]
	enabledRoleIds?: string[]
	onResourceToggle: (scope: string, action: string, resource: Partial<Record<string, unknown>>) => void
	onToggle: (scope: string, action: string,) => void
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
		onToggle(scope, configAction.action);
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
						onChange={(inputValue: string[]) => onResourceToggle(scope, configAction.action, { agency_ids: inputValue })}
						value={selectedAgencyIds}
					/>
				)}

				{onResourceToggle && configAction.resources?.includes('ALERT_REFERENCE_TYPES') && (
					<AlertReferenceTypePermissionMultiselect
						disabled={hasPermissionFromRole}
						onChange={(inputValue: string[]) => onResourceToggle(scope, configAction.action, { reference_types: inputValue })}
						value={selectedAlertReferenceTypeIds}
					/>
				)}

			</Grid>
		</CheckCard>
	);

	//
}
