'use client';

import { RolesCreateBasicInfo } from '@/components/roles/create/RolesCreateBasicInfo';
import { RolesCreateHeader } from '@/components/roles/create/RolesCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function RolesCreate() {
	return (
		<Pane header={[<RolesCreateHeader key="header" />]}>
			<RolesCreateBasicInfo />
		</Pane>
	);
}
