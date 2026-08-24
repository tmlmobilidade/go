'use client';

import { PermissionSectionItem } from '@/components/permissions/PermissionSectionItem';
import { PermissionConfigAction } from '@/lib/permissions';
import { type Role } from '@tmlmobilidade/go-types-core';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import { Collapsible, Grid, Section, type SelectDataItem } from '@tmlmobilidade/ui';

/* * */

interface PermissionSectionProps {
	agenciesOptions: SelectDataItem[]
	configActions: PermissionConfigAction[]
	description: string
	disabled?: boolean
	enabledPermissions: Permission[]
	enabledRoleIds?: string[]
	onResourceToggle?: (permission: Permission) => void
	onToggle: (permission: Permission) => void
	rolesData: Role[]
	scope: string
	title: string
}

/* * */

export function PermissionSection({ agenciesOptions, configActions, description, disabled, enabledPermissions, enabledRoleIds, onResourceToggle, onToggle, rolesData, scope, title }: PermissionSectionProps) {
	return (
		<Collapsible description={description} title={title}>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{configActions.map(config => (
						<PermissionSectionItem
							key={config.action}
							agenciesOptions={agenciesOptions}
							configAction={config}
							disabled={disabled}
							enabledPermissions={enabledPermissions}
							enabledRoleIds={enabledRoleIds}
							onResourceToggle={onResourceToggle}
							onToggle={onToggle}
							rolesData={rolesData}
							scope={scope}
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);
}
