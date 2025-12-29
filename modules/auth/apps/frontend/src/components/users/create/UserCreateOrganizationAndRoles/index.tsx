'use client';

/* * */

import { useUserCreateContext } from '@/components/users/create/UserCreate.context';
import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { useRolesContext } from '@/contexts/Roles.context';
import { Grid, MultiSelect, Section, Select } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function UserCreateOrganizationAndRoles() {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();
	const organizationsContext = useOrganizationsContext();

	const userCreateContext = useUserCreateContext();

	const { t } = useTranslation('auth', { keyPrefix: 'users.create.organizationAndRoles' });

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
		<Section>
			<Grid columns="a" gap="md">
				<Select
					key={userCreateContext.data.form.key('organization_id')}
					clearable={false}
					data={organizationItems}
					label={t('fields.organization')}
					placeholder={t('fields.organization_placeholder')}
					required
					{...userCreateContext.data.form.getInputProps('organization_id')}
				/>
				<MultiSelect
					key={userCreateContext.data.form.key('role_ids')}
					data={availableRoles}
					label={t('fields.roles')}
					placeholder={t('fields.roles_placeholder')}
					{...userCreateContext.data.form.getInputProps('role_ids', { multiple: true })}
				/>
			</Grid>
		</Section>

	);

	//
}
