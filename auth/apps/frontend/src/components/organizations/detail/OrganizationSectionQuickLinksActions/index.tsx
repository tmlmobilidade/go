'use client';

/* * */

import { openOrganizationQuickLinksModal } from '@/components/organizations/detail/OrganizationDetailQuickLinksModal';
import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { HomeLink } from '@tmlmobilidade/types';
import { Button, Section } from '@tmlmobilidade/ui';

/* * */

export function OrganizationDetailQuickLinksActions({ link, organization_id }: { link: HomeLink, organization_id: string }) {
	//

	//
	// A. Setup variables

	const organizationDetailsContext = useOrganizationsDetailContext();

	//
	// B. Handle actions

	const handleDelete = () => {
		if (!organizationDetailsContext.data.form) return;
		const updatedLinks = organizationDetailsContext.data.form.values.home_links.filter(l => l.title !== link.title);
		organizationDetailsContext.data.form.values.home_links = updatedLinks;
	};

	const handleEdit = () => {
		openOrganizationQuickLinksModal({ link, organization_id });
	};

	//
	// C. Render components
	return (
		<Section flexDirection="row" gap="sm" padding="none">
			<Button label="Delete" onClick={handleDelete}>Delete</Button>
			<Button label="Edit" onClick={handleEdit}>Edit</Button>
		</Section>
	);

	//
}
