'use client';

import { OrganizationDetailHeader } from '@/components/organizations/detail/OrganizationDetailHeader';
import { OrganizationDetailBasicInfo } from '@/components/organizations/detail/OrganizationSectionBasicInfo';
import { OrganizationDetailQuickLinks } from '@/components/organizations/detail/OrganizationSectionQuickLinks';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function OrganizationDetail() {
	return (
		<Pane header={[<OrganizationDetailHeader />]}>
			<OrganizationDetailBasicInfo />
			<OrganizationDetailQuickLinks />
		</Pane>
	);
}
