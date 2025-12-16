'use client';

/* * */

import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { useUserDetailContext } from '@/contexts/UserDetail.context';
import { Grid, Section, Select } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function UserDetailOrganization() {
	//

	//
	// A. Setup variables

	const userDetailsContext = useUserDetailContext();
	const organizationsContext = useOrganizationsContext();
	const { t } = useTranslation('auth', { keyPrefix: 'users.detail.organization' });

	//
	// B. Transform data

	const organizationItems = useMemo(() => {
		if (!organizationsContext.data?.raw) return [];
		return organizationsContext.data.raw.map(organization => ({
			label: organization.long_name,
			value: organization._id,
		}));
	}, [organizationsContext.data.raw]);

	//
	// C. Render components

	return (
		<Section>
			<Grid columns="a" gap="md">
				<Select
					key={userDetailsContext.data.form.key('organization_id')}
					clearable={false}
					data={organizationItems}
					label={t('organization_label')}
					required
					{...userDetailsContext.data.form.getInputProps('organization_id')}
				/>
			</Grid>
		</Section>

	);

	//
}
