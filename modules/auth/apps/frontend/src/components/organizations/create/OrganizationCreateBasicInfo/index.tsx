'use client';

import { useOrganizationCreateContext } from '@/components/organizations/create/OrganizationCreate.context';
import { CreateOrganizationSchema } from '@tmlmobilidade/types';
import { Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function OrganizationCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const organizationCreateContext = useOrganizationCreateContext();

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Section gap="lg">
			<Grid columns="aab" gap="lg">
				<TextInput
					key={organizationCreateContext.data.form.key('long_name')}
					label={t('default:organizations.create.SectionBasicInfo.fields.long_name.label')}
					maxLength={255}
					placeholder={t('default:organizations.create.SectionBasicInfo.fields.long_name.placeholder')}
					withAsterisk={!CreateOrganizationSchema.shape.long_name}
					data-autofocus
					{...organizationCreateContext.data.form.getInputProps('long_name')}
				/>
				<TextInput
					key={organizationCreateContext.data.form.key('short_name')}
					label={t('default:organizations.create.SectionBasicInfo.fields.short_name.label')}
					maxLength={10}
					placeholder={t('default:organizations.create.SectionBasicInfo.fields.short_name.placeholder')}
					withAsterisk={!CreateOrganizationSchema.shape.short_name}
					{...organizationCreateContext.data.form.getInputProps('short_name')}
				/>
			</Grid>
		</Section>
	);

	//
}
