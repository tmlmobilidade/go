'use client';

/* * */

import { useRolesContext } from '@/contexts/Roles.context';
import { useUserCreateContext } from '@/contexts/UserCreate.context';
import { Grid, MultiSelect, Section } from '@tmlmobilidade/ui';

/* * */

export function UserCreateRoles() {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();
	const userCreateContext = useUserCreateContext();

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
					key={userCreateContext.data.form.key('role_ids')}
					data={availableRoles}
					label="Roles"
					placeholder="Selecione uma opção..."
					{...userCreateContext.data.form.getInputProps('role_ids', { multiple: true })}
				/>
			</Grid>
		</Section>
	);

	//
}
