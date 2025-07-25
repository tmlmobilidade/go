'use client';

import { PermissionSectionGroup } from '@/components/permissions/PermissionSectionGroup';
/* * */

import { RoleDetailBasicInfo } from '@/components/roles/detail/RoleDetailBasicInfo';
import { RoleDetailHeader } from '@/components/roles/detail/RoleDetailHeader';
import { useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function RoleDetail() {
	const rolesDetailContext = useRoleDetailContext();

	return (
		<Pane header={[<RoleDetailHeader />]}>
			<RoleDetailBasicInfo />
			<PermissionSectionGroup
				onResourceToggle={rolesDetailContext.actions.handlePermissionResourceToggle}
				onToggle={rolesDetailContext.actions.handlePermissionToggle}
				permissions={rolesDetailContext.data.form.values.permissions}
			/>
		</Pane>
	);
}
