'use client';

/* * */

import { RoleDetailBasicInfo } from '@/components/roles/RoleDetailBasicInfo';
import { RoleDetailHeader } from '@/components/roles/RoleDetailHeader';
import { RoleDetailPermissions } from '@/components/roles/RoleDetailPermissions';
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
