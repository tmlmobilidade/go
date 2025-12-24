'use client';

/* * */

import { useScheduledAlertCreateContext } from '@/components/scheduled/create/ScheduledAlertCreate.context';
import { DateTimeInput, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function ScheduledAlertCreateSectionValidity() {
	//

	//
	// A. Setup variables

	const scheduledAlertCreateContext = useScheduledAlertCreateContext();

	//
	// B. Render components

	return (
		<Section>
			<Grid columns="ab" gap="md">
				<DateTimeInput
					key={scheduledAlertCreateContext.data.form.key('active_period_start_date')}
					label="Data de Início"
					{...scheduledAlertCreateContext.data.form.getInputProps('active_period_start_date')}
				/>
				<DateTimeInput
					key={scheduledAlertCreateContext.data.form.key('active_period_end_date')}
					label="Data de Fim"
					clearable
					{...scheduledAlertCreateContext.data.form.getInputProps('active_period_end_date')}
				/>
			</Grid>
		</Section>
	);

	//
}
