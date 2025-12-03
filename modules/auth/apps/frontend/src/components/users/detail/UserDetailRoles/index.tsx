'use client';

/* * */

import { useRolesContext } from '@/contexts/Roles.context';
import { useUserDetailContext } from '@/contexts/UserDetail.context';
import { Grid, MultiSelect, Section } from '@tmlmobilidade/ui';

/* * */

export function UsersDetailRoles() {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();
	const usersDetailContext = useUserDetailContext();

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
					key={usersDetailContext.data.form.key('role_ids')}
					data={availableRoles}
					label="Roles"
					placeholder="Selecione uma opção..."
					{...usersDetailContext.data.form.getInputProps('role_ids', { multiple: true })}
				/>
			</Grid>
		</Section>
	);

	//
}
