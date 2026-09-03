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
				<Grid columns="ab" gap="lg">
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
