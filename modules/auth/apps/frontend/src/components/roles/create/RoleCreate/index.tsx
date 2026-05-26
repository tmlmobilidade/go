'use client';

import { RoleCreateBasicInfo } from '@/components/roles/create/RoleCreateBasicInfo';
import { RoleCreateHeader } from '@/components/roles/create/RoleCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function RoleCreate() {
	return (
		<Pane header={[<RoleCreateHeader />]}>
			<RoleCreateBasicInfo />
		</Pane>
	);
}
