'use client';

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { Dates } from '@tmlmobilidade/dates';
import { CreateAgencySchema } from '@tmlmobilidade/types';
import { Collapsible, ContextFormController, Grid, Section, Select, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencyDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionBasicInfo.description')}
			title={t('default:agencies.detail.SectionBasicInfo.title')}
		>
			<Section gap="lg">
				<Grid columns="aabc" gap="lg">
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.name.label')}
								maxLength={CreateAgencySchema.shape.name.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.name.placeholder')}
								readOnly={agencyDetailContext.flags.isReadOnly}
								withAsterisk={!CreateAgencySchema.shape.name.isOptional()}
							/>
						)}
					/>
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.public_name.label')}
								maxLength={CreateAgencySchema.shape.public_name.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.public_name.placeholder')}
								readOnly={agencyDetailContext.flags.isReadOnly}
								withAsterisk={!CreateAgencySchema.shape.name.isOptional()}
							/>
						)}
					/>
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="short_name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.short_name.label')}
								maxLength={CreateAgencySchema.shape.short_name.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.short_name.placeholder')}
								readOnly={agencyDetailContext.flags.isReadOnly}
								withAsterisk={!CreateAgencySchema.shape.short_name.isOptional()}
							/>
						)}
					/>
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="code"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.code.label')}
								maxLength={CreateAgencySchema.shape.code.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.code.placeholder')}
								readOnly={agencyDetailContext.flags.isReadOnly}
								withAsterisk={!CreateAgencySchema.shape.code.isOptional()}
							/>
						)}
					/>
				</Grid>
				<Grid columns="abc" gap="lg">
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="public_email"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.public_email.label')}
								maxLength={CreateAgencySchema.shape.public_email.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.public_email.placeholder')}
								readOnly={agencyDetailContext.flags.isReadOnly}
								type="email"
								withAsterisk={!CreateAgencySchema.shape.public_email.isOptional()}
							/>
						)}
					/>
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="phone"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.phone.label')}
								maxLength={CreateAgencySchema.shape.phone.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.phone.placeholder')}
								readOnly={agencyDetailContext.flags.isReadOnly}
								type="tel"
								withAsterisk={!CreateAgencySchema.shape.phone.isOptional()}
							/>
						)}
					/>
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="website_url"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.website_url.label')}
								maxLength={CreateAgencySchema.shape.website_url.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.website_url.placeholder')}
								readOnly={agencyDetailContext.flags.isReadOnly}
								type="url"
								withAsterisk={!CreateAgencySchema.shape.website_url.isOptional()}
							/>
						)}
					/>
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="fare_url"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.fare_url.label')}
								maxLength={CreateAgencySchema.shape.fare_url.maxLength}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionBasicInfo.fields.fare_url.placeholder')}
								readOnly={agencyDetailContext.flags.isReadOnly}
								type="url"
								withAsterisk={!CreateAgencySchema.shape.fare_url.isOptional()}
							/>
						)}
					/>
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="timezone"
						render={({ field, fieldState }) => (
							<Select
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.timezone.label')}
								onChange={field.onChange}
								readOnly={agencyDetailContext.flags.isReadOnly}
								value={field.value}
								withAsterisk={!CreateAgencySchema.shape.timezone.isOptional()}
								data={Dates.TIMEZONE_LIST.map(tz => ({
									label: tz,
									value: tz,
								}))}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
