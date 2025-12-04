'use client';

/* * */

import { useRolesContext } from '@/contexts/Roles.context';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Grid, MultiSelect, Section } from '@tmlmobilidade/ui';

/* * */

export function UsersDetailRoles() {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();
	const usersDetailContext = useUsersDetailContext();

	//
	// B. Transform data

	const availableRoles = rolesContext.data.raw.map(role => ({
		label: role.name,
		value: role._id,
	}));

	//
	// C. Render components

	return (
		<Section>
			<Grid columns="a" gap="md">
				<MultiSelect
					data={availableRoles}
					label="Roles"
					selected={usersDetailContext.data.form.values.role_ids ?? []}
					{...usersDetailContext.data.form.getInputProps('role_ids', { multiple: true })}
				/>
			</Grid>
		</Section>
	);

	//
}
