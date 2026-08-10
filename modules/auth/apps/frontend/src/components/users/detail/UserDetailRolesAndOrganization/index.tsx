'use client';

import { useUserDetailContext } from '@/components/users/detail/UserDetail.context';
import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { useRolesContext } from '@/contexts/Roles.context';
import { Collapsible, ContextFormController, Grid, MultiSelect, Section, Select } from '@tmlmobilidade/ui';
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
					<ContextFormController
						control={userDetailContext.form.instance.control}
						name="organization_id"
						render={({ field, fieldState }) => (
							<Select
								clearable={false}
								data={organizationItems}
								error={fieldState.error?.message}
								label={t('default:users.detail.RolesAndOrganization.fields.organization.label')}
								onBlur={field.onBlur}
								onChange={field.onChange}
								readOnly={userDetailContext.flags.isReadOnly}
								value={field.value}
								required
							/>
						)}
					/>
					<ContextFormController
						control={userDetailContext.form.instance.control}
						name="role_ids"
						render={({ field, fieldState }) => (
							<MultiSelect
								data={availableRoles}
								error={fieldState.error?.message}
								label={t('default:users.detail.RolesAndOrganization.fields.roles.label')}
								onBlur={field.onBlur}
								onChange={field.onChange}
								placeholder={t('default:users.detail.RolesAndOrganization.fields.roles.placeholder')}
								readOnly={userDetailContext.flags.isReadOnly}
								value={field.value}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
