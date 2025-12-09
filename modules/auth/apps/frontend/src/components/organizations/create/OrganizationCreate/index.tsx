'use client';

/* * */

import { OrganizationCreateBasicInfo } from '@/components/organizations/create/OrganizationCreateBasicInfo';
import { OrganizationCreateHeader } from '@/components/organizations/create/OrganizationCreateHeader';
import { useOrganizationCreateContext } from '@/contexts/OrganizationCreate.context';
import { FormModal } from '@tmlmobilidade/ui';

/* * */

export function OrganizationCreate() {
	//

	//
	// A. Setup variables

	const organizationCreateContext = useOrganizationCreateContext();

	//
	// B. Render components

	return (
		<FormModal
			header={[<OrganizationCreateHeader onClose={organizationCreateContext.modal.close} />]}
			isOpen={organizationCreateContext.modal.state}
			onClose={organizationCreateContext.modal.close}
		>
			<OrganizationCreateBasicInfo />
		</FormModal>
	);

	//
}
