'use client';

/* * */

import { UsersDetailBasicInfo } from '@/components/users/detail/UsersDetailBasicInfo';
import { UsersDetailHeader } from '@/components/users/detail/UsersDetailHeader';
import { UsersDetailPermissions } from '@/components/users/detail/UsersDetailPermissions';
import { UsersDetailRoles } from '@/components/users/detail/UsersDetailRoles';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function UsersDetail() {
	return (
		<Pane header={[<UsersDetailHeader />]}>
			<UsersDetailBasicInfo />
			<UsersDetailRoles />
			<UsersDetailPermissions />
		</Pane>
	);
}
