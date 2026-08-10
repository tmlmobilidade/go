'use client';

import { UploadImage } from '@/components/common/UploadImage';
import { useOrganizationsDetailContext } from '@/components/organizations/detail/OrganizationDetail.context';
import { CreateOrganizationSchema } from '@tmlmobilidade/types';
import { Collapsible, ContextFormController, Grid, Section, TextInput } from '@tmlmobilidade/ui';
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
					<ContextFormController
						control={organizationDetailContext.form.instance.control}
						name="long_name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:organizations.detail.SectionBasicInfo.fields.long_name.label')}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={field.onChange}
								placeholder={t('default:organizations.detail.SectionBasicInfo.fields.long_name.placeholder')}
								readOnly={organizationDetailContext.flags.isReadOnly}
								value={field.value}
								withAsterisk={!CreateOrganizationSchema.shape.long_name.isOptional()}
							/>
						)}
					/>
					<ContextFormController
						control={organizationDetailContext.form.instance.control}
						name="short_name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:organizations.detail.SectionBasicInfo.fields.short_name.label')}
								maxLength={10}
								onBlur={field.onBlur}
								onChange={field.onChange}
								placeholder={t('default:organizations.detail.SectionBasicInfo.fields.short_name.placeholder')}
								readOnly={organizationDetailContext.flags.isReadOnly}
								value={field.value}
								withAsterisk={!CreateOrganizationSchema.shape.short_name.isOptional()}
							/>
						)}
					/>
				</Grid>
				<Section>
					<Grid columns="ab" gap="lg">
						<ContextFormController
							control={organizationDetailContext.form.instance.control}
							name="logo_dark"
							render={() => (
								<UploadImage
									imageUrl={organizationDetailContext.data.logoDarkUrl}
									label={t('default:organizations.detail.SectionBasicInfo.fields.logo_dark.label')}
									onDelete={() => organizationDetailContext.actions.deleteImage('dark')}
									onFileChange={organizationDetailContext.actions.fileChangedDark}
								/>
							)}
						/>
						<ContextFormController
							control={organizationDetailContext.form.instance.control}
							name="logo_light"
							render={() => (
								<UploadImage
									imageUrl={organizationDetailContext.data.logoLightUrl}
									label={t('default:organizations.detail.SectionBasicInfo.fields.logo_light.label')}
									onDelete={() => organizationDetailContext.actions.deleteImage('light')}
									onFileChange={organizationDetailContext.actions.fileChangedLight}
								/>
							)}
						/>
					</Grid>
				</Section>
			</Section>
		</Collapsible>
	);

	//
}
