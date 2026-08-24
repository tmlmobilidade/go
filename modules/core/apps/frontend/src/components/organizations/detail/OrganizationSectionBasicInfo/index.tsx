'use client';

import { CreateOrganizationSchema } from '@tmlmobilidade/go-types-core';
import { Collapsible, Grid, ImageUpload, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useOrganizationsDetailFormContext } from '../OrganizationsDetailForm.context';
import { useOrganizationsImageDetailData } from '../use-organizations-image-detail-data';

/* * */

export function OrganizationsDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, capabilities, form, status } = useOrganizationsDetailFormContext();

	const { data: logoLightUrlValue } = useOrganizationsImageDetailData('light');
	const { data: logoDarkUrlValue } = useOrganizationsImageDetailData('dark');

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:organizations.detail.SectionBasicInfo.description')}
			title={t('default:organizations.detail.SectionBasicInfo.title')}
			defaultOpen
		>
			<Section gap="lg">

				<Grid columns="aab" gap="lg">
					<StandardFormController
						control={form.control}
						name="long_name"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:organizations.detail.SectionBasicInfo.fields.long_name.label')}
								maxLength={CreateOrganizationSchema.shape.long_name.maxLength}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('default:organizations.detail.SectionBasicInfo.fields.long_name.placeholder')}
								value={field.value ?? ''}
								data-autofocus
								withAsterisk
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="short_name"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:organizations.detail.SectionBasicInfo.fields.short_name.label')}
								maxLength={CreateOrganizationSchema.shape.short_name.maxLength}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('default:organizations.detail.SectionBasicInfo.fields.short_name.placeholder')}
								value={field.value ?? ''}
								data-autofocus
								withAsterisk
							/>
						)}
					/>
				</Grid>

				<Grid columns="ab" gap="lg">
					<ImageUpload
						isDisabled={form.formState.isDirty}
						isLoading={status.isUpdatingLightLogo}
						label={t('default:organizations.detail.SectionBasicInfo.fields.logo_light.label')}
						onChange={actions.updateLightLogo}
						onDelete={actions.deleteLightLogo}
						value={logoLightUrlValue}
					/>
					<ImageUpload
						isDisabled={form.formState.isDirty}
						isLoading={status.isUpdatingDarkLogo}
						label={t('default:organizations.detail.SectionBasicInfo.fields.logo_dark.label')}
						onChange={actions.updateDarkLogo}
						onDelete={actions.deleteDarkLogo}
						value={logoDarkUrlValue}
					/>
				</Grid>

			</Section>
		</Collapsible>
	);
}
