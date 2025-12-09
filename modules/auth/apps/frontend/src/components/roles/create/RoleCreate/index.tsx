'use client';

/* * */

import { RoleCreateHeader } from '@/components/roles/create//RoleCreateHeader';
import { RoleCreateBasicInfo } from '@/components/roles/create/RoleCreateBasicInfo';
import { useRoleCreateContext } from '@/contexts/RoleCreate.context';
import { FormModal } from '@tmlmobilidade/ui';

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
