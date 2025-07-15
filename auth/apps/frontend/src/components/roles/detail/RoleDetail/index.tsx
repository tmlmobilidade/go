'use client';

/* * */

import { RoleDetailBasicInfo } from '@/components/roles/detail/RoleDetailBasicInfo';
import { RoleDetailHeader } from '@/components/roles/detail/RoleDetailHeader';
import { RoleDetailPermissions } from '@/components/roles/detail/RoleDetailPermissions';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function RoleDetail() {
	return (
		<Pane header={[<RoleDetailHeader />]}>
			<RoleDetailBasicInfo />
			<RoleDetailPermissions />
		</Pane>
	);
}
