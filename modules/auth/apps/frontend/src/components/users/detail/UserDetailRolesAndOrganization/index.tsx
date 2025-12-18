'use client';

/* * */

import { useUserDetailContext } from '@/components/users/detail/UserDetail.context';
import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { useRolesContext } from '@/contexts/Roles.context';
import { Collapsible, Grid, MultiSelect, Section, Select } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function UserDetailRolesAndOrganization() {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();
	const userDetailContext = useUserDetailContext();
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

	const availableRoles = useMemo(() => {
		if (!rolesContext.data?.raw) return [];
		return rolesContext.data.raw.map(role => ({
			label: role.name,
			value: role._id,
		}));
	}, [rolesContext.data.raw]);

	//
	// C. Render components

	return (
		<Collapsible
			description="O conjunto de permissões que o utilizador tem atribuído no sistema e as organizações a que pertence."
			title="Roles & Organizações"
		>
			<Section>
				<Grid columns="a" gap="md">
					<Select
						key={userDetailContext.data.form.key('organization_id')}
						clearable={false}
						data={organizationItems}
						label="Organização"
						readOnly={userDetailContext.flags.isReadOnly}
						required
						{...userDetailContext.data.form.getInputProps('organization_id')}
					/>
					<MultiSelect
						key={userDetailContext.data.form.key('role_ids')}
						data={availableRoles}
						label="Roles"
						placeholder="Selecione uma opção..."
						readOnly={userDetailContext.flags.isReadOnly}
						{...userDetailContext.data.form.getInputProps('role_ids', { multiple: true })}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
