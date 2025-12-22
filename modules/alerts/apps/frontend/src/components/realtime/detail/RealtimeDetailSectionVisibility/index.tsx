'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RealtimeDetailSectionVisibility() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.detail.sectionVisibility' });
	//
	// B. Transform data

	const startDateValue = realtimeDetailContext.data.form.getValues().publish_start_date;
	const endDateValue = realtimeDetailContext.data.form.getValues().publish_end_date;

	//
	// C. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					label={t('fields.publish_start_date_label')}
					fullWidth
					{...realtimeDetailContext.data.form.getInputProps('publish_start_date')}
					value={startDateValue}
					onChange={(date) => {
						realtimeDetailContext.data.form.setFieldValue('publish_start_date', date);
					}}
				/>
				<DateTimePicker
					label={t('fields.publish_end_date_label')}
					clearable
					fullWidth
					{...realtimeDetailContext.data.form.getInputProps('publish_end_date')}
					value={endDateValue}
					onChange={(date) => {
						realtimeDetailContext.data.form.setFieldValue('publish_end_date', date);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
