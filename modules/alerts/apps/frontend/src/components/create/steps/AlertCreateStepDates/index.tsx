'use client';

import { PermissionCatalog } from '@tmlmobilidade/types';
import { ContextFormController, DateTimeInput, Divider, Grid, Label, Section, Text, useContextFormWatch, useMeContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAlertsCreateFormContext } from '../../shared/AlertsCreateForm.context';

/* * */

export function AlertCreateStepDates() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();
	const { form: alertsCreateForm } = useAlertsCreateFormContext();

	const agencyIdValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'agency_id' });
	const referenceTypeValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'reference_type' });

	//
	// B. Transform data

	const hasPermissionToEdit = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update_dates,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: agencyIdValue,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update_dates,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: referenceTypeValue,
		},
	]);

	//
	// C. Render components

	return (
		<>

			<Section gap="sm">
				<Label size="lg" caps>{t('alerts:create.AlertCreateStepDates.sections.active_period.title')}</Label>
				<Text size="sm" weight="medium">{t('alerts:create.AlertCreateStepDates.sections.active_period.description')}</Text>
				<Grid columns="ab" gap="md">
					<ContextFormController
						control={alertsCreateForm.control}
						name="active_period_start_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('alerts:create.AlertCreateStepDates.sections.active_period.fields.active_period_start_date.label')}
								onChange={field.onChange}
								readOnly={!hasPermissionToEdit}
								value={field.value}
							/>
						)}
					/>
					<ContextFormController
						control={alertsCreateForm.control}
						name="active_period_end_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('alerts:create.AlertCreateStepDates.sections.active_period.fields.active_period_end_date.label')}
								onChange={field.onChange}
								readOnly={!hasPermissionToEdit}
								value={field.value}
								clearable
							/>
						)}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section gap="sm">
				<Label size="lg" caps>{t('alerts:create.AlertCreateStepDates.sections.publish_date.title')}</Label>
				<Text size="sm" weight="medium">{t('alerts:create.AlertCreateStepDates.sections.publish_date.description')}</Text>
				<Grid columns="ab" gap="md">
					<ContextFormController
						control={alertsCreateForm.control}
						name="publish_start_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('alerts:create.AlertCreateStepDates.sections.publish_date.fields.publish_date_start_date.label')}
								onChange={field.onChange}
								readOnly={!hasPermissionToEdit}
								value={field.value}
								clearable
							/>
						)}
					/>
					<ContextFormController
						control={alertsCreateForm.control}
						name="publish_end_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('alerts:create.AlertCreateStepDates.sections.publish_date.fields.publish_date_end_date.label')}
								onChange={field.onChange}
								readOnly={!hasPermissionToEdit}
								value={field.value}
								clearable
							/>
						)}
					/>
				</Grid>
			</Section>

		</>
	);
}
