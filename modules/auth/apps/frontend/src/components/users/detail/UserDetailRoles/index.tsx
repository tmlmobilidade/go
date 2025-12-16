'use client';

/* * */

import { useRolesContext } from '@/contexts/Roles.context';
import { useUserDetailContext } from '@/contexts/UserDetail.context';
import { Grid, MultiSelect, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UserDetailRoles() {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();
	const userDetailContext = useUserDetailContext();

	const { t } = useTranslation('auth', { keyPrefix: 'users.detail.roles' });
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
					label={t('roles_label')}
					placeholder={t('roles_placeholder')}
					{...userDetailContext.data.form.getInputProps('role_ids', { multiple: true })}
				/>
			</Grid>
		</Section>
	);

	//
}
