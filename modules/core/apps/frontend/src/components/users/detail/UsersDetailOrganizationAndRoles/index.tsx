'use client';

import { Collapsible, Grid, MultiSelect, Section, Select, StandardFormController } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useUsersOrganizationsData } from '../../shared/use-users-organizations-data';
import { useUsersRolesData } from '../../shared/use-users-roles-data';
import { useUsersDetailFormContext } from '../UsersDetailForm.context';

/* * */

export function UsersDetailOrganizationAndRoles() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { options: rolesOptions } = useUsersRolesData();
	const { options: organizationsOptions } = useUsersOrganizationsData();

	const { capabilities, form } = useUsersDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible description={t('default:users.detail.RolesAndOrganization.description')} title={t('default:users.detail.RolesAndOrganization.title')}>
			<Section>
				<Grid columns="a" gap="md">

					<StandardFormController
						control={form.control}
						name="organization_id"
						render={({ field, fieldState }) => (
							<Select
								clearable={false}
								data={organizationsOptions}
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:users.detail.RolesAndOrganization.fields.organization.label')}
								onBlur={field.onBlur}
								onChange={value => field.onChange(value)}
								placeholder={t('default:users.detail.RolesAndOrganization.fields.organization.placeholder')}
								value={field.value}
								required
								withAsterisk
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name="role_ids"
						render={({ field, fieldState }) => (
							<MultiSelect
								clearable={false}
								data={rolesOptions}
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:users.create.OrganizationAndRoles.fields.roles.label')}
								onBlur={field.onBlur}
								onChange={value => field.onChange(value)}
								placeholder={t('default:users.create.OrganizationAndRoles.fields.roles.placeholder')}
								value={field.value}
								required
								withAsterisk
							/>
						)}
					/>

				</Grid>
			</Section>
		</Collapsible>
	);
}
