'use client';

/* * */

import { useRolesContext } from '@/contexts/Roles.context';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Collapsible, Combobox, Grid, Section } from '@tmlmobilidade/ui';

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
		<Collapsible
			description="O conjunto de permissões que o utilizador tem atribuído no sistema e as organizações a que pertence."
			title="Roles & Organizações"
		>
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
		</Collapsible>
	);

	//
}
