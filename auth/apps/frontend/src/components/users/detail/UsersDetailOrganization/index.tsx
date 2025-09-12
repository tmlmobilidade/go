'use client';
/* * */

import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Combobox, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function UsersDetailOrganization() {
	//

	//
	// A. Setup variables

	const userDetailsContext = useUsersDetailContext();
	const { data: organizations } = useOrganizationsContext();

	//
	// B. Transform data

	const organizationItems = organizations.raw.map(organization => ({
		label: organization.abbreviation,
		value: organization._id,
	}));

	//
	// B. Render components

	return (
		<Section>
			<Grid columns="a" gap="md">
				<Combobox
					data={organizationItems}
					label="Organizações"
					value={userDetailsContext.data.form.values.organization_id}
					fullWidth
					{...userDetailsContext.data.form.getInputProps('organization_id')}
				/>
			</Grid>
		</Section>

	);

	//
}
