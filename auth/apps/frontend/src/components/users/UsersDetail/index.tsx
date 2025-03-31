'use client';

/* * */

import { UsersDetailBasicInfo } from '@/components/users/UsersDetailBasicInfo';
import { UsersDetailHeader } from '@/components/users/UsersDetailHeader';
import { UsersDetailPermissions } from '@/components/users/UsersDetailPermissions';
import { UsersDetailRoles } from '@/components/users/UsersDetailRoles';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function UsersDetail() {
	return (
		<Pane header={<UsersDetailHeader />}>
			<UsersDetailBasicInfo />
			<UsersDetailRoles />
			<UsersDetailPermissions />
		</Pane>
	);
}
