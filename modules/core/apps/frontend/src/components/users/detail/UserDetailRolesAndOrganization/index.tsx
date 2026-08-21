'use client';

import { useUserDetailContext } from '@/components/users/detail/UserDetail.context';
import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { useRolesContext } from '@/contexts/Roles.context';
import { Collapsible, Grid, MultiSelect, Section, Select } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function UserDetailRolesAndOrganization() {
	//

	//
	// A. Setup Variables

	const { t } = useTranslation();
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
		<Collapsible description={t('default:users.detail.RolesAndOrganization.description')} title={t('default:users.detail.RolesAndOrganization.title')}>
			<Section>
				<Grid columns="a" gap="md">
					<Select
						key={userDetailContext.data.form.key('organization_id')}
						clearable={false}
						data={organizationItems}
						label={t('default:users.detail.RolesAndOrganization.fields.organization.label')}
						readOnly={userDetailContext.flags.isReadOnly}
						required
						{...userDetailContext.data.form.getInputProps('organization_id')}
					/>
					<MultiSelect
						key={userDetailContext.data.form.key('role_ids')}
						data={availableRoles}
						label={t('default:users.detail.RolesAndOrganization.fields.roles.label')}
						placeholder={t('default:users.detail.RolesAndOrganization.fields.roles.placeholder')}
						readOnly={userDetailContext.flags.isReadOnly}
						{...userDetailContext.data.form.getInputProps('role_ids', { multiple: true })}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
