'use client';

import { OrganizationsDetailContacts } from '@/components/organizations/detail/OrganizationsDetailContacts';
import { OrganizationsDetailGeoJson } from '@/components/organizations/detail/OrganizationsDetailGeoJson';
import { OrganizationsDetailHeader } from '@/components/organizations/detail/OrganizationsDetailHeader';
import { OrganizationsDetailOpenData } from '@/components/organizations/detail/OrganizationsDetailOpenData';
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
			<OrganizationsDetailGeoJson />
			<OrganizationsDetailOpenData />
			<OrganizationsDetailContacts />
			<OrganizationsDetailQuickLinks />
		</Pane>
	);
}
