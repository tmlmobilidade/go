'use client';

import { PermissionSectionGroup } from '@/components/permissions/components/PermissionSectionGroup';
/* * */

import { RoleDetailBasicInfo } from '@/components/roles/detail/RoleDetailBasicInfo';
import { RoleDetailHeader } from '@/components/roles/detail/RoleDetailHeader';
import { useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function RoleDetail() {
	const { actions, data } = useRoleDetailContext();

	return (
		<Pane header={[<RoleDetailHeader />]}>
			<RoleDetailBasicInfo />
			<PermissionSectionGroup
				onResourceToggle={actions.handlePermissionResourceToggle}
				onToggle={actions.handlePermissionToggle}
				permissions={data.form.values.permissions}
			/>
		</Pane>
	);
}
