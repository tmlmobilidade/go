'use client';

/* * */

import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Grid, Section, Select } from '@tmlmobilidade/ui';

/* * */

export function UsersDetailOrganization() {
	//

	//
	// A. Setup variables

	const userDetailsContext = useUsersDetailContext();
	const { data: organizations } = useOrganizationsContext();

	//
	// B. Transform data

	const organizationItems = organizations.raw?.map(organization => ({
		label: organization.long_name,
		value: organization._id,
	})) ?? [];

	//
	// B. Render components

	return (
		<Section>
			<Grid columns="a" gap="md">
				<Select
					key={userDetailsContext.data.form.key('organization_id')}
					clearable={false}
					data={organizationItems}
					label="Organização"
					required
					{...userDetailsContext.data.form.getInputProps('organization_id')}
				/>
			</Grid>
		</Section>

	);

	//
}
