'use client';

/* * */

import { UserCreateBasicInfo } from '@/components/users/create/UserCreateBasicInfo';
import { UserCreateHeader } from '@/components/users/create/UserCreateHeader';
import { UserCreateOrganization } from '@/components/users/create/UserCreateOrganization';
import { UserCreateRoles } from '@/components/users/create/UserCreateRoles';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Divider, FormModal, keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function UserCreate() {
	//

	//
	// C. Setup variables

	const router = useRouter();

	//
	// C. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams(PAGE_ROUTES.auth.USERS_LIST, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<FormModal
			header={[<UserCreateHeader onClose={handleClose} />]}
			onClose={handleClose}
		>
			<UserCreateBasicInfo />
			<Divider />
			<UserCreateOrganization />
			<UserCreateRoles />
		</FormModal>
	);

	//
}
