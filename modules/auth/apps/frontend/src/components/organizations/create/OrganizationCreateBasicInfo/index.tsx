'use client';

/* * */

import { useOrganizationCreateContext } from '@/contexts/OrganizationCreate.context';
import { CreateOrganizationSchema } from '@tmlmobilidade/types';
import { Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function OrganizationCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const organizationCreateContext = useOrganizationCreateContext();

	const { t } = useTranslation('auth', { keyPrefix: 'organizations.create.basic_info' });

	//
	// B. Render components

	return (
		<Section gap="lg">
			<Grid columns="aab" gap="lg">
				<TextInput
					key={organizationCreateContext.data.form.key('long_name')}
					label={t('longname_label')}
					maxLength={255}
					placeholder={t('longname_placeholder')}
					withAsterisk={!CreateOrganizationSchema.shape.long_name}
					{...organizationCreateContext.data.form.getInputProps('long_name')}
				/>
				<TextInput
					key={organizationCreateContext.data.form.key('short_name')}
					label={t('shortname_label')}
					maxLength={10}
					placeholder={t('shortname_placeholder')}
					withAsterisk={!CreateOrganizationSchema.shape.short_name}
					{...organizationCreateContext.data.form.getInputProps('short_name')}
				/>
			</Grid>
		</Section>
	);

	//
}
