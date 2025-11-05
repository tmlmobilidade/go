'use client';

/* * */

import { useRolesContext } from '@/contexts/Roles.context';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Combobox, Grid, Section } from '@go/ui';

/* * */

export function UsersDetailRoles() {
	//

	//
	// A. Setup variables

	const { data } = useUsersDetailContext();
	const { data: roles } = useRolesContext();

	//
	// B. Transform data

	const roleItems = roles.raw.map(role => ({
		label: role.name,
		value: role._id,
	}));

	//
	// C. Render components

	return (
		<Section>
			<Grid columns="a" gap="md">
				<Combobox
					data={roleItems}
					label="Roles"
					fullWidth
					multiple
					{...data.form.getInputProps('role_ids', { multiple: true })}
				/>
			</Grid>
		</Section>
	);

	//
}
