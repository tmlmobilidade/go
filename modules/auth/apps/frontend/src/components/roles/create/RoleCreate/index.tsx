'use client';

/* * */

import { useRoleCreateContext } from '@/contexts/RoleCreate.context';
import { FormModal } from '@tmlmobilidade/ui';

import { RoleCreateBasicInfo } from '../RoleCreateBasicInfo';
import { RoleCreateHeader } from '../RoleCreateHeader';

/* * */

export function RoleCreate() {
	//

	//
	// A. Setup variables

	const rolesCreateContext = useRoleCreateContext();

	//
	// B. Render components

	return (
		<FormModal
			header={[<RoleCreateHeader onClose={rolesCreateContext.modal.close} />]}
			isOpen={rolesCreateContext.modal.state}
			onClose={rolesCreateContext.modal.close}
		>
			<RoleCreateBasicInfo />
		</FormModal>
	);

	//
}
