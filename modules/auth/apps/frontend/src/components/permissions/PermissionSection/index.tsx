'use client';

/* * */

import CheckCard from '@/components/common/CheckCard';
import { hasRolePermission } from '@/lib/permission-helpers';
import { PermissionAction } from '@/lib/permissions';
import { Permission } from '@go/types';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

import { AgencyPermissionMultiselect } from '../AgencyPermissionMultiselect';
import { EnableEmailNotificationsSwitch } from '../EnableEmailNotificationsSwitch';

/* * */

export type WithResourceToggle<T = unknown, K = Record<string, unknown>> = T & {
	onResourceToggle: (scope: string, action: string, resource: Partial<K>) => void
	onSendEmailToggle?: (scope: string, action: string, resource: Partial<K>) => void
};

export interface PermissionSectionInputProps<T = unknown> {
	onToggle: (scope: string, action: string) => void
	permissions: Permission<T>[]
}

interface PermissionsSectionProps {
	actions: PermissionAction[]
	currentPermissions: Permission<unknown>[]
	description: string
	onResourceToggle?: (scope: string, action: string, resource: Partial<Record<string, unknown>>) => void
	onToggle: (scope: string, action: string, send_email?: boolean) => void
	roles?: { _id: string, permissions: Permission<unknown>[] }[]
	scope: string
	title: string
	userRoleIds?: string[]
}

/* * */

export function PermissionsSection({
	actions,
	currentPermissions,
	description,
	onResourceToggle,
	onToggle,
	roles = [],
	scope,
	title,
	userRoleIds = [],
}: PermissionsSectionProps) {
	const getPermissionData = (action: string) => {
		const permission = currentPermissions.find(
			p => p.scope === scope && p.action === action,
		);
		const hasPermission = !!permission;
		const fromRole = hasRolePermission(scope, action, userRoleIds, roles);

		return {
			fromRole,
			hasPermission,
		};
	};

	return (
		<Collapsible description={description} title={title}>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{actions.map(({ description, key, label, resources }) => {
						const { fromRole, hasPermission } = getPermissionData(key);
						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								fromRole={fromRole}
								label={label}
								onChange={() => onToggle(scope, key)}
							>
								{onResourceToggle && resources?.includes('AGENCIES') && (
									<AgencyPermissionMultiselect
										description="Agências ao qual o utilizador tem acesso a para esta ação"
										label="Agências"
										onChange={value => onResourceToggle(scope, key, { agency_ids: value || [] })}
										selected={(currentPermissions.find(p => p.scope === scope && p.action === key)?.resource as Record<string, unknown>)?.agency_ids as string[] || []}
									/>
								)}
								{onResourceToggle && resources?.includes('EMAIL_NOTIFICATIONS') && (
									<EnableEmailNotificationsSwitch
										checked={(currentPermissions.find(p => p.scope === scope && p.action === key)?.resource as Record<string, unknown>)?.send_mail as boolean || false}
										description="Notificações por email para esta ação"
										label="Notificações por Email"
										onChange={value => onResourceToggle(scope, key, { send_mail: value || false })}
									/>
								)}
							</CheckCard>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
