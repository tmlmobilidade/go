'use client';

/* * */

import { useRolesContext } from '@/contexts/Roles.context';
import { useUserDetailContext } from '@/components/users/detail/UserDetail.context';
import { Grid, MultiSelect, Section } from '@tmlmobilidade/ui';

/* * */

export function UserDetailRoles() {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();
	const userDetailContext = useUserDetailContext();

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
					key={userDetailContext.data.form.key('role_ids')}
					data={availableRoles}
					label="Roles"
					placeholder="Selecione uma opção..."
					{...userDetailContext.data.form.getInputProps('role_ids', { multiple: true })}
				/>
			</Grid>
		</Section>
	);

	//
}
