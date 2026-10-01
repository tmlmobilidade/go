'use client';

import { OrganizationsDetailHeader } from '@/components/organizations/detail/OrganizationsDetailHeader';
import { OrganizationsDetailBasicInfo } from '@/components/organizations/detail/OrganizationSectionBasicInfo';
import { OrganizationsDetailQuickLinks } from '@/components/organizations/detail/OrganizationSectionQuickLinks';
import { Pane } from '@tmlmobilidade/ui';

import { useOrganizationsDetailData } from '../use-organizations-detail-data';

/* * */

export function OrganizationsDetail() {
	//

	const { isLoading } = useOrganizationsDetailData();

	return (
		<Pane header={[<OrganizationsDetailHeader key="header" />]} isLoading={isLoading}>
			<OrganizationsDetailBasicInfo />
			<OrganizationsDetailQuickLinks />
		</Pane>
	);
}
