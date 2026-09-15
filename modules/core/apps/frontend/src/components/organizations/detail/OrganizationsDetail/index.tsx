'use client';

import { OrganizationsDetailBasicInfo } from '@/components/organizations/detail/OrganizationsDetailBasicInfo';
import { OrganizationsDetailHeader } from '@/components/organizations/detail/OrganizationsDetailHeader';
import { OrganizationsDetailQuickLinks } from '@/components/organizations/detail/OrganizationsDetailQuickLinks';
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
