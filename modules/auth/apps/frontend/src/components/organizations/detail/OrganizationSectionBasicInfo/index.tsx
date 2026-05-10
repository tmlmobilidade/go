'use client';

import { UploadImage } from '@/components/common/UploadImage';
import { useOrganizationsDetailContext } from '@/components/organizations/detail/OrganizationDetail.context';
import { CreateOrganizationSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function OrganizationDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const organizationDetailContext = useOrganizationsDetailContext();

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:organizations.detail.SectionBasicInfo.description')}
			title={t('default:organizations.detail.SectionBasicInfo.title')}
		>
			<Section gap="lg">
				<Grid columns="aab" gap="lg">
					<TextInput
						key={organizationDetailContext.data.form.key('long_name')}
						label={t('default:organizations.detail.SectionBasicInfo.fields.long_name.label')}
						maxLength={255}
						placeholder={t('default:organizations.detail.SectionBasicInfo.fields.long_name.placeholder')}
						readOnly={organizationDetailContext.flags.isReadOnly}
						withAsterisk={!CreateOrganizationSchema.shape.long_name}
						{...organizationDetailContext.data.form.getInputProps('long_name')}
					/>
					<TextInput
						key={organizationDetailContext.data.form.key('short_name')}
						label={t('default:organizations.detail.SectionBasicInfo.fields.short_name.label')}
						maxLength={10}
						placeholder={t('default:organizations.detail.SectionBasicInfo.fields.short_name.placeholder')}
						readOnly={organizationDetailContext.flags.isReadOnly}
						withAsterisk={!CreateOrganizationSchema.shape.short_name}
						{...organizationDetailContext.data.form.getInputProps('short_name')}
					/>
				</Grid>
				<Section>
					<Grid columns="ab" gap="lg">
						<UploadImage
							imageUrl={organizationDetailContext.data.logoDarkUrl}
							label={t('default:organizations.detail.SectionBasicInfo.fields.logo_dark.label')}
							onDelete={() => organizationDetailContext.actions.deleteImage('dark')}
							onFileChange={organizationDetailContext.actions.fileChangedDark}
						/>
						<UploadImage
							imageUrl={organizationDetailContext.data.logoLightUrl}
							label={t('default:organizations.detail.SectionBasicInfo.fields.logo_light.label')}
							onDelete={() => organizationDetailContext.actions.deleteImage('light')}
							onFileChange={organizationDetailContext.actions.fileChangedLight}
						/>
					</Grid>
				</Section>
			</Section>
		</Collapsible>
	);

	//
}
