'use client';

/* * */

import { useAlertDetailContext } from '@/components/scheduled/detail/AlertDetail.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertDetailSectionValidity() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const startDateValue = alertDetailContext.data.form.getValues().active_period_start_date;
	const endDateValue = alertDetailContext.data.form.getValues().active_period_end_date;
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.detail.sectionValidity' });

	//
	// C. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					key={alertDetailContext.data.form.key('active_period_start_date')}
					label={t('activePeriodStartDateLabel')}
					fullWidth
					{...alertDetailContext.data.form.getInputProps('active_period_start_date')}
					value={startDateValue}
					onChange={(date) => {
						alertDetailContext.data.form.setFieldValue('active_period_start_date', date);
					}}
				/>
				<DateTimePicker
					key={alertDetailContext.data.form.key('active_period_end_date')}
					label={t('activePeriodEndDateLabel')}
					clearable
					fullWidth
					{...alertDetailContext.data.form.getInputProps('active_period_end_date')}
					value={endDateValue}
					onChange={(date) => {
						alertDetailContext.data.form.setFieldValue('active_period_end_date', date);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
