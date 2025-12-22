'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RealtimeDetailSectionValidity() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.detail.sectionValidity' });
	//
	// B. Transform data

	const startDateValue = realtimeDetailContext.data.form.getValues().active_period_start_date;
	const endDateValue = realtimeDetailContext.data.form.getValues().active_period_end_date;

	//
	// C. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					label={t('fields.active_period_start_date_label')}
					fullWidth
					{...realtimeDetailContext.data.form.getInputProps('active_period_start_date')}
					value={startDateValue}
					onChange={(date) => {
						realtimeDetailContext.data.form.setFieldValue('active_period_start_date', date);
					}}
				/>
				<DateTimePicker
					label={t('fields.active_period_end_date_label')}
					clearable
					fullWidth
					{...realtimeDetailContext.data.form.getInputProps('active_period_end_date')}
					value={endDateValue}
					onChange={(date) => {
						realtimeDetailContext.data.form.setFieldValue('active_period_end_date', date);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
