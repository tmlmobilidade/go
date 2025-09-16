'use client';

import CheckCard from '@/components/common/CheckCard';
import { IconChooser } from '@/components/common/IconChooser';
import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';

/* * */

import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function OrganizationDetailQuickLinks() {
	//

	//
	// A. Setup variables

	const organizationDetailContext = useOrganizationsDetailContext();

	//
	// B. Transform data

	const organizationItems = organizationDetailContext.data.home_links.map(organization => ({
		label: organization.title,
		value: organization._id,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description="Links rápidos que aparecem na página inicial."
			title="Links rápidos"
		>
			<Section gap="lg">
				<Grid columns="ab" gap="lg">
					{organizationItems.map(({ label, value }) => (
						<CheckCard
							key={value}
							checked={organizationDetailContext.data.form.values.home_links.map(value => value._id).includes(value)}
							description={label}
							label={label}
							onChange={() => console.log('changed')}
						>
							<IconChooser />
						</CheckCard>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
