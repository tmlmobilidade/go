'use client';

/* * */

import { UsersDetailBasicInfo } from '@/components/users/UsersDetailBasicInfo';
import { UsersDetailHeader } from '@/components/users/UsersDetailHeader';
import { UsersDetailPermissions } from '@/components/users/UsersDetailPermissions';
import { UsersDetailRoles } from '@/components/users/UsersDetailRoles';
import { SimpleSurface } from '@tmlmobilidade/ui';

/* * */

export function UsersDetail() {
	return (
		<SimpleSurface>
			<UsersDetailHeader />
			<UsersDetailBasicInfo />
			<UsersDetailRoles />
			<UsersDetailPermissions />
		</SimpleSurface>
	);
}
