'use client';

/* * */

import { closeCreateOrganizationModal } from '@/components/organizations/create/OrganizationCreate.modal';
import { OrganizationCreateBasicInfo } from '@/components/organizations/create/OrganizationCreateBasicInfo';
import { OrganizationCreateHeader } from '@/components/organizations/create/OrganizationCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function OrganizationCreate() {
	return (
		<Pane header={[<OrganizationCreateHeader onClose={closeCreateOrganizationModal} />]}>
			<OrganizationCreateBasicInfo />
		</Pane>
	);
}
