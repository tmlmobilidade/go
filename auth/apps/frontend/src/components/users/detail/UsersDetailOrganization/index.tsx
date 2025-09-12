/* * */

import { useRolesContext } from '@/contexts/Roles.context';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Combobox, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function UsersDetailOrganization() {
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

	console.log('USSSER DATA', data);

	//
	// B. Render components

	return (
		<Section>
			<Grid columns="a" gap="md">
				<Combobox
					data={roleItems}
					label="Organizações"
					fullWidth
					multiple
					{...data.form.getInputProps('role_ids', { multiple: true })}
				/>
			</Grid>
		</Section>

	);

	//
}
