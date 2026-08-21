'use client';

import { OrganizationCreateBasicInfo } from '@/components/organizations/create/OrganizationCreateBasicInfo';
import { OrganizationCreateHeader } from '@/components/organizations/create/OrganizationCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function OrganizationCreate() {
	return (
		<Pane header={[<OrganizationCreateHeader />]}>
			<OrganizationCreateBasicInfo />
		</Pane>
	);
}
