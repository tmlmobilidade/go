'use client';

/* * */

import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { useUserCreateContext } from '@/contexts/UserCreate.context';
import { Grid, Section, Select } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function UserCreateOrganization() {
	//

	//
	// A. Setup variables

	const userCreateContext = useUserCreateContext();
	const organizationsContext = useOrganizationsContext();

	//
	// B. Transform data

	const organizationItems = useMemo(() => {
		if (!organizationsContext.data?.raw) return [];
		return organizationsContext.data.raw.map(organization => ({
			label: organization.long_name,
			value: organization._id,
		}));
	}, [organizationsContext.data.raw]);

	//
	// C. Render components

	return (
		<Section>
			<Grid columns="a" gap="md">
				<Select
					key={userCreateContext.data.form.key('organization_id')}
					clearable={false}
					data={organizationItems}
					label="Organização"
					required
					{...userCreateContext.data.form.getInputProps('organization_id')}
				/>
			</Grid>
		</Section>

	);

	//
}
