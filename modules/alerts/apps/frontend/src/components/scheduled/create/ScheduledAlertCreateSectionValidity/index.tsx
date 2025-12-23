'use client';

/* * */

import { useScheduledAlertCreateContext } from '@/components/scheduled/create/ScheduledAlertCreate.context';
import { DateTimePicker, Section } from '@tmlmobilidade/ui';

/* * */

export function ScheduledAlertCreateSectionValidity() {
	//

	//
	// A. Setup variables

	const scheduledAlertCreateContext = useScheduledAlertCreateContext();

	//
	// B. Transform data

	const startDateValue = scheduledAlertCreateContext.data.form.getValues().active_period_start_date;
	const endDateValue = scheduledAlertCreateContext.data.form.getValues().active_period_end_date;

	//
	// C. Render components

	return (
		<Section flexDirection="row" gap="md">
			<DateTimePicker
				key={scheduledAlertCreateContext.data.form.key('active_period_start_date')}
				label="Data de Início"
				fullWidth
				{...scheduledAlertCreateContext.data.form.getInputProps('active_period_start_date')}
				value={startDateValue}
				onChange={(date) => {
					scheduledAlertCreateContext.data.form.setFieldValue('active_period_start_date', date);
				}}
			/>
			<DateTimePicker
				key={scheduledAlertCreateContext.data.form.key('active_period_end_date')}
				label="Data de Fim"
				clearable
				fullWidth
				{...scheduledAlertCreateContext.data.form.getInputProps('active_period_end_date')}
				value={endDateValue}
				onChange={(date) => {
					scheduledAlertCreateContext.data.form.setFieldValue('active_period_end_date', date);
				}}
			/>
		</Section>
	);

	//
}
