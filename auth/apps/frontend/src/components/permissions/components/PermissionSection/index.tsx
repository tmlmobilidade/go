'use client';

/* * */

import CheckCard from '@/components/common/CheckCard';
import { Permission } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export type WithResourceToggle<T = unknown, K = Record<string, unknown>> = T & {
	onResourceToggle: (scope: string, action: string, resource: Partial<K>) => void
};

export interface PermissionSectionInputProps<T = unknown> {
	onToggle: (scope: string, action: string) => void
	permissions: Permission<T>[]
}

interface PermissionAction {
	description: string
	key: string
	label: string
}

interface PermissionsSectionProps {
	actions: PermissionAction[]
	children?: React.ReactNode
	currentPermissions: Permission<unknown>[]
	description: string
	onToggle: (scope: string, action: string) => void
	scope: string
	title: string
}

/* * */

export function PermissionsSection({
	actions,
	children,
	currentPermissions,
	description,
	onToggle,
	scope,
	title,
}: PermissionsSectionProps) {
	const getPermissionData = (action: string) => {
		const permission = currentPermissions.find(
			p => p.scope === scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	return (
		<Collapsible description={description} title={title}>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{actions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() => onToggle(scope, key)}
							>
								{children}
							</CheckCard>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
