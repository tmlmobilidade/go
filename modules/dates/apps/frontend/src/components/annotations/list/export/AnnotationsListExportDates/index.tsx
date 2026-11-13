'use client';

import { toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { DateInput, Grid, StandardFormController, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAnnotationsListExportFormContext } from '../AnnotationsListExport/AnnotationsListExportForm.context';

/* * */

export function AnnotationsListExportDates() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useAnnotationsListExportFormContext();
	const startDate = useStandardFormWatch({ control: form.control, name: 'start_date' });
	const endDate = useStandardFormWatch({ control: form.control, name: 'end_date' });

	//
	// B. Render components

	return (
		<Grid columns="ab" gap="md">
			<StandardFormController
				control={form.control}
				name="start_date"
				render={({ field, fieldState }) => (
					<DateInput
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('annotations:list.AnnotationsListExportDates.start')}
						maxDate={endDate ? toCalendarDate(endDate) : undefined}
						onChange={field.onChange}
						placeholder={t('annotations:list.AnnotationsListExportDates.placeholder')}
						value={field.value ?? null}
						clearable
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="end_date"
				render={({ field, fieldState }) => (
					<DateInput
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('annotations:list.AnnotationsListExportDates.end')}
						minDate={startDate ? toCalendarDate(startDate) : undefined}
						onChange={field.onChange}
						placeholder={t('annotations:list.AnnotationsListExportDates.placeholder')}
						value={field.value ?? null}
						clearable
					/>
				)}
			/>
		</Grid>
	);
}
