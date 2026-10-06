'use client';

import { CreateAgencySchema } from '@tmlmobilidade/go-types-core';
import { LanguageTagValues, TimezoneIdentifiedValues } from '@tmlmobilidade/go-types-shared';
import { Collapsible, Grid, Label, Section, Select, StandardFormController, TagGroup, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';
import { useAgenciesDetailOrganizationsData } from '../use-agencies-detail-organizations-data';

/* * */

export function AgenciesDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useAgenciesDetailFormContext();

	const { data: organizations, error: organizationsError, isLoading: organizationsLoading } = useAgenciesDetailOrganizationsData();

	const organizationTags = organizations.map(organization => ({ label: `${organization.long_name} (${organization.short_name})` }));
	const organizationsStatusLabel = organizationsLoading
		? t('default:agencies.detail.SectionBasicInfo.fields.organizations.loading')
		: t('default:agencies.detail.SectionBasicInfo.fields.organizations.empty');

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionBasicInfo.description')}
			title={t('default:agencies.detail.SectionBasicInfo.title')}
		>
			<Section gap="lg">
				<Grid columns="abc" gap="lg">
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
						name="primary_language"
						render={({ field, fieldState }) => (
							<Select
								data={LanguageTagValues.map(lt => ({ label: lt, value: lt }))}
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionBasicInfo.fields.primary_language.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
								withAsterisk={!CreateAgencySchema.shape.primary_language.isOptional()}
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
				<Grid columns="a" gap="lg">
					<Section gap="xs" padding="none">
						<Label size="sm">{t('default:agencies.detail.SectionBasicInfo.fields.organizations.label')}</Label>
						{organizationsError ? (
							<Label variant="danger">{organizationsError}</Label>
						) : organizationsLoading || !organizationTags.length ? (
							<Label variant="muted">{organizationsStatusLabel}</Label>
						) : (
							<TagGroup limit={organizationTags.length} tags={organizationTags} />
						)}
					</Section>
				</Grid>
			</Section>
		</Collapsible>
	);
}
