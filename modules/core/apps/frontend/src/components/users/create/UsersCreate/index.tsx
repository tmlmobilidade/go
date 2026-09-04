'use client';

import { UsersCreateBasicInfo } from '@/components/users/create/UsersCreateBasicInfo';
import { UsersCreateHeader } from '@/components/users/create/UsersCreateHeader';
import { UsersCreateOrganizationAndRoles } from '@/components/users/create/UsersCreateOrganizationAndRoles';
import { Divider, Pane } from '@tmlmobilidade/ui';

/* * */

export function UsersCreate() {
	return (
		<Pane header={[<UsersCreateHeader key="header" />]}>
			<UsersCreateBasicInfo />
			<Divider />
			<UsersCreateOrganizationAndRoles />
		</Pane>
	);
}
