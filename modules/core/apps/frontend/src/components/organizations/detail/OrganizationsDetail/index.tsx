'use client';

import { OrganizationsDetailHeader } from '@/components/organizations/detail/OrganizationsDetailHeader';
import { OrganizationsDetailBasicInfo } from '@/components/organizations/detail/OrganizationSectionBasicInfo';
import { OrganizationsDetailQuickLinks } from '@/components/organizations/detail/OrganizationSectionQuickLinks';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function OrganizationsDetail() {
	return (
		<Pane header={[<OrganizationsDetailHeader key="header" />]}>
			<OrganizationsDetailBasicInfo />
			<OrganizationsDetailQuickLinks />
		</Pane>
	);
}
