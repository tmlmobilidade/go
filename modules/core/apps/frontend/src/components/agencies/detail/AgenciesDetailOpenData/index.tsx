'use client';

import { Collapsible, Divider, Grid, Section, StandardFormController, Switch, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';

/* * */

export function AgenciesDetailOpenData() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useAgenciesDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionOpenData.description')}
			title={t('default:agencies.detail.SectionOpenData.title')}
		>
			<Section gap="lg">
				<Grid columns="abc" gap="md">
					<StandardFormController
						control={form.control}
						name="open_data.details.name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionOpenData.fields.details.name.label')}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionOpenData.fields.details.name.placeholder')}
								readOnly={!capabilities.editEnabled}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="open_data.details.email"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionOpenData.fields.details.email.label')}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionOpenData.fields.details.email.placeholder')}
								readOnly={!capabilities.editEnabled}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="open_data.details.phone"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionOpenData.fields.details.phone.label')}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionOpenData.fields.details.phone.placeholder')}
								readOnly={!capabilities.editEnabled}
							/>
						)}
					/>
				</Grid>
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={form.control}
						name="open_data.details.website_url"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionOpenData.fields.details.website_url.label')}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionOpenData.fields.details.website_url.placeholder')}
								readOnly={!capabilities.editEnabled}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="open_data.details.fare_url"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionOpenData.fields.details.fare_url.label')}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionOpenData.fields.details.fare_url.placeholder')}
								readOnly={!capabilities.editEnabled}
							/>
						)}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section gap="lg">
				<StandardFormController
					control={form.control}
					name="open_data.services.gtfs_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.services.gtfs_enabled.label')}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="open_data.services.positions_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.services.positions_enabled.label')}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="open_data.services.eta_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.services.eta_enabled.label')}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="open_data.services.service_alerts_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.services.service_alerts_enabled.label')}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
						/>
					)}
				/>
			</Section>
		</Collapsible>
	);
}
