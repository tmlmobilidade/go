'use client';

/* * */

import { closeCreateUserModal } from '@/components/users/create/UserCreate.modal';
import { UserCreateBasicInfo } from '@/components/users/create/UserCreateBasicInfo';
import { UserCreateHeader } from '@/components/users/create/UserCreateHeader';
import { UserCreateOrganizationAndRoles } from '@/components/users/create/UserCreateOrganizationAndRoles';
import { Divider, Pane } from '@tmlmobilidade/ui';

/* * */

export function UserCreate() {
	return (
		<Pane header={[<UserCreateHeader onClose={closeCreateUserModal} />]}>
			<UserCreateBasicInfo />
			<Divider />
			<UserCreateOrganizationAndRoles />
		</Pane>
	);
}
