'use client';

import { Collapsible, DateTimeInput, Grid, Section, StandardFormController } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';

/* * */

export function StopsDetailSectionChecks() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useStopsDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:stops.detail.SectionChecks.description')}
			title={t('default:stops.detail.SectionChecks.title')}
		>
			<Section>
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={form.control}
						name="checks.last_infrastructure_check"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionChecks.fields.last_infrastructure_check.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
								clearable
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="checks.last_infrastructure_maintenance"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionChecks.fields.last_infrastructure_maintenance.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
								clearable
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="checks.last_schedules_check"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionChecks.fields.last_schedules_check.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
								clearable
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="checks.last_schedules_maintenance"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionChecks.fields.last_schedules_maintenance.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
								clearable
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
