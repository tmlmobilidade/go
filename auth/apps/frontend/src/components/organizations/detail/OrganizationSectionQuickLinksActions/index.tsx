'use client';

/* * */

import { openOrganizationQuickLinksModal } from '@/components/organizations/detail/OrganizationDetailQuickLinksModal';
import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { Button, Section } from '@tmlmobilidade/ui';

/* * */

export function OrganizationDetailQuickLinksActions({ organization_id, row_id }: { organization_id: string, row_id: string }) {
	//

	//
	// A. Setup variables

	const organizationDetailsContext = useOrganizationsDetailContext();

	//
	// B. Handle actions

	const handleDelete = () => {
		if (!organizationDetailsContext.data.form) return;
		const currentHomeLinks = organizationDetailsContext.data.form.values.home_links;
		const newHomeLinks = currentHomeLinks.filter(link => link.title !== row_id);
		organizationDetailsContext.data.form.setFieldValue('home_links', newHomeLinks);
	};

	const handleEdit = () => {
		openOrganizationQuickLinksModal({ organization_id });
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
