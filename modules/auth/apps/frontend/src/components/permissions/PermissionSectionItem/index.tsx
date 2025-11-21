'use client';

/* * */

import { CheckCard } from '@/components/common/CheckCard';
import { AgencyPermissionMultiselect } from '@/components/permissions/AgencyPermissionMultiselect';
import { useRolesContext } from '@/contexts/Roles.context';
import { hasRolePermission } from '@/lib/permission-helpers';
import { PermissionConfigAction } from '@/lib/permissions';
import { type Permission } from '@tmlmobilidade/types';
import { Label } from '@tmlmobilidade/ui';
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
		return currentPermissionEntry.resources.agency_ids || [];
	})();

	//
	// C. Handle actions

	const handleToggle = () => {
		if (hasPermissionFromRole) return;
		onToggle(scope, configAction.action);
	};

	const handleResourceToggle = (inputValue: string[]) => {
		if (hasPermissionFromRole) return;
		if (!currentPermissionEntry) return;
		onResourceToggle(scope, configAction.action, { agency_ids: inputValue });
	};

	//
	// D. Render components

	return (
		<CheckCard
			checked={!!currentPermissionEntry || hasPermissionFromRole}
			description={configAction.description}
			disabled={hasPermissionFromRole}
			label={configAction.label}
			onChange={handleToggle}
		>
			{onResourceToggle && configAction.resources?.includes('AGENCIES') && (
				<AgencyPermissionMultiselect
					description="Operadores ao qual o utilizador tem acesso para esta acção."
					label="Operadores"
					onChange={handleResourceToggle}
					selected={selectedAgencyIds}
				/>
			)}
			{hasPermissionFromRole && <Label caps>Permissão Herdada pelo grupo de permissões</Label>}
		</CheckCard>
	);

	//
}
