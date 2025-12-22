'use client';

/* * */

import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateSectionValidity() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.create.sectionValidity' });
	//
	// B. Transform data

	const startDateValue = alertCreateContext.data.form.getValues().active_period_start_date;
	const endDateValue = alertCreateContext.data.form.getValues().active_period_end_date;

	//
	// C. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					key={alertCreateContext.data.form.key('active_period_start_date')}
					label={t('fields.active_period_start_date_label')}
					fullWidth
					{...alertCreateContext.data.form.getInputProps('active_period_start_date')}
					value={startDateValue}
					onChange={(date) => {
						alertCreateContext.data.form.setFieldValue('active_period_start_date', date);
					}}
				/>
				<DateTimePicker
					key={alertCreateContext.data.form.key('active_period_end_date')}
					label={t('fields.active_period_end_date_label')}
					clearable
					fullWidth
					{...alertCreateContext.data.form.getInputProps('active_period_end_date')}
					value={endDateValue}
					onChange={(date) => {
						alertCreateContext.data.form.setFieldValue('active_period_end_date', date);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
