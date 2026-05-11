'use client';

import { PermissionSectionItem } from '@/components/permissions/PermissionSectionItem';
import { PermissionConfigAction } from '@/lib/permissions';
import { type Permission } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

/* * */

interface PermissionSectionProps {
	configActions: PermissionConfigAction[]
	description: string
	enabledPermissions: Permission[]
	enabledRoleIds?: string[]
	onResourceToggle?: (scope: string, action: string, resource: Partial<Record<string, unknown>>) => void
	onToggle: (scope: string, action: string, send_email?: boolean) => void
	scope: string
	title: string
}

/* * */

export function PermissionSection({ configActions, description, enabledPermissions, enabledRoleIds, onResourceToggle, onToggle, scope, title }: PermissionSectionProps) {
	return (
		<Collapsible description={description} title={title}>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{configActions.map(config => (
						<PermissionSectionItem
							key={config.action}
							configAction={config}
							enabledPermissions={enabledPermissions}
							enabledRoleIds={enabledRoleIds}
							onResourceToggle={onResourceToggle}
							onToggle={onToggle}
							scope={scope}
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);
}
