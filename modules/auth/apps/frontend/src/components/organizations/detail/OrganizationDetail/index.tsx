'use client';

import { useOrganizationsDetailContext } from '@/components/organizations/detail/OrganizationDetail.context';
import { OrganizationDetailHeader } from '@/components/organizations/detail/OrganizationDetailHeader';
import { OrganizationDetailBasicInfo } from '@/components/organizations/detail/OrganizationSectionBasicInfo';
import { OrganizationDetailQuickLinks } from '@/components/organizations/detail/OrganizationSectionQuickLinks';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function OrganizationDetail() {
	const organizationDetailContext = useOrganizationsDetailContext();

	if (organizationDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (organizationDetailContext.flags.error) {
		return <ErrorDisplay message={organizationDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<OrganizationDetailHeader key="header" />]}>
			<OrganizationDetailBasicInfo />
			<OrganizationDetailQuickLinks />
		</Pane>
	);
}
