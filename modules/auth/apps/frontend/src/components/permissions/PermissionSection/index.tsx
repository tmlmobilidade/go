'use client';

/* * */

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

// {/* {actions.map(({ description, key, label, resources }) => {
// const { fromRole, hasPermission } = getPermissionData(key);
// return (
// 	<CheckCard
// 		key={key}
// 		checked={hasPermission}
// 		description={description}
// 		fromRole={fromRole}
// 		label={label}
// 		onChange={() => onToggle(scope, key)}
// 	>
// 		{onResourceToggle && resources?.includes('AGENCIES') && (
// 			<AgencyPermissionMultiselect
// 				description="Agências ao qual o utilizador tem acesso a para esta ação"
// 				label="Agências"
// 				onChange={value => onResourceToggle(scope, key, { agency_ids: value || [] })}
// 				selected={(currentPermissions.find(p => p.scope === scope && p.action === key)['resources'] as Record<string, unknown>)?.agency_ids as string[] || []}
// 			/>
// 		)}
// 		{onResourceToggle && resources?.includes('EMAIL_NOTIFICATIONS') && (
// 			<EnableEmailNotificationsSwitch
// 				checked={(currentPermissions.find(p => p.scope === scope && p.action === key)['resources'] as Record<string, unknown>)?.send_mail as boolean || false}
// 				description="Notificações por email para esta ação"
// 				label="Notificações por Email"
// 				onChange={value => onResourceToggle(scope, key, { send_mail: value || false })}
// 			/>
// 		)}
// 	</CheckCard>
// );
// 	// })} */}
