'use client';

/* * */

import { UserCreateBasicInfo } from '@/components/users/create/UserCreateBasicInfo';
import { UserCreateHeader } from '@/components/users/create/UserCreateHeader';
import { UserCreateOrganizationAndRoles } from '@/components/users/create/UserCreateOrganizationAndRoles';
import { useUserCreateContext } from '@/contexts/UserCreate.context';
import { Divider, FormModal } from '@tmlmobilidade/ui';

/* * */

export function UserCreate() {
	//

	//
	// A. Setup variables

	const userCreateContext = useUserCreateContext();

	//
	// C. Render components

	return (
		<FormModal
			header={[<UserCreateHeader onClose={userCreateContext.modal.close} />]}
			isOpen={userCreateContext.modal.state}
			onClose={userCreateContext.modal.close}
		>
			<UserCreateBasicInfo />
			<Divider />
			<UserCreateOrganizationAndRoles />
		</FormModal>
	);

	//
}
