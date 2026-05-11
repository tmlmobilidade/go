'use client';

import { UserCreateBasicInfo } from '@/components/users/create/UserCreateBasicInfo';
import { UserCreateHeader } from '@/components/users/create/UserCreateHeader';
import { UserCreateOrganizationAndRoles } from '@/components/users/create/UserCreateOrganizationAndRoles';
import { Divider, Pane } from '@tmlmobilidade/ui';

/* * */

export function UserCreate() {
	return (
		<Pane header={[<UserCreateHeader />]}>
			<UserCreateBasicInfo />
			<Divider />
			<UserCreateOrganizationAndRoles />
		</Pane>
	);
}
