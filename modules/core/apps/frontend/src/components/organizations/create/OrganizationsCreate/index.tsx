'use client';

import { OrganizationsCreateBasicInfo } from '@/components/organizations/create/OrganizationsCreateBasicInfo';
import { OrganizationsCreateHeader } from '@/components/organizations/create/OrganizationsCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function OrganizationsCreate() {
	return (
		<Pane header={[<OrganizationsCreateHeader key="header" />]}>
			<OrganizationsCreateBasicInfo />
		</Pane>
	);
}
