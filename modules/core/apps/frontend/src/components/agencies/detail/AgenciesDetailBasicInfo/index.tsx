'use client';

import { CreateAgencySchema } from '@tmlmobilidade/go-types-core';
import { TimezoneIdentifiedValues } from '@tmlmobilidade/go-types-shared';
import { Collapsible, Grid, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';

/* * */

export function AgenciesDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useAgenciesDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionBasicInfo.description')}
			title={t('default:agencies.detail.SectionBasicInfo.title')}
		>
			<Section gap="lg">
				<Grid columns="abcd" gap="lg">
					<StandardFormController
						control={form.control}
						name="name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.name.label')}
								maxLength={CreateAgencySchema.shape.name.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.name.placeholder')}
								readOnly={!capabilities.editEnabled}
								withAsterisk={!CreateAgencySchema.shape.name.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="public_name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.public_name.label')}
								maxLength={CreateAgencySchema.shape.public_name.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.public_name.placeholder')}
								readOnly={!capabilities.editEnabled}
								withAsterisk={!CreateAgencySchema.shape.public_name.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="short_name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.short_name.label')}
								maxLength={CreateAgencySchema.shape.short_name._def.innerType.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.short_name.placeholder')}
								readOnly={!capabilities.editEnabled}
								withAsterisk={!CreateAgencySchema.shape.short_name.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="code"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.code.label')}
								maxLength={CreateAgencySchema.shape.code.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.code.placeholder')}
								readOnly={!capabilities.editEnabled}
								withAsterisk={!CreateAgencySchema.shape.code.isOptional()}
							/>
						)}
					/>
				</Grid>
				<Grid columns="abc" gap="lg">
					<StandardFormController
						control={form.control}
						name="public_email"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.public_email.label')}
								maxLength={CreateAgencySchema.shape.public_email.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.public_email.placeholder')}
								readOnly={!capabilities.editEnabled}
								type="email"
								withAsterisk={!CreateAgencySchema.shape.public_email.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="phone"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.phone.label')}
								maxLength={CreateAgencySchema.shape.phone.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.phone.placeholder')}
								readOnly={!capabilities.editEnabled}
								type="tel"
								withAsterisk={!CreateAgencySchema.shape.phone.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="website_url"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.website_url.label')}
								maxLength={CreateAgencySchema.shape.website_url.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.website_url.placeholder')}
								readOnly={!capabilities.editEnabled}
								type="url"
								withAsterisk={!CreateAgencySchema.shape.website_url.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="fare_url"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.fare_url.label')}
								maxLength={CreateAgencySchema.shape.fare_url.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.fare_url.placeholder')}
								readOnly={!capabilities.editEnabled}
								type="url"
								withAsterisk={!CreateAgencySchema.shape.fare_url.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="timezone"
						render={({ field, fieldState }) => (
							<Select
								data={TimezoneIdentifiedValues.map(tz => ({ label: tz, value: tz }))}
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.timezone.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
								withAsterisk={!CreateAgencySchema.shape.timezone.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="pta_name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.pta_name.label')}
								maxLength={CreateAgencySchema.shape.pta_name._def.innerType.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.pta_name.placeholder')}
								readOnly={!capabilities.editEnabled}
								withAsterisk={!CreateAgencySchema.shape.pta_name.isOptional()}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
