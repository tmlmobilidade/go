'use client';

/* * */

import { useAlertDetailContext } from '@/components/scheduled/detail/AlertDetail.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertDetailSectionVisibility() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const startDateValue = alertDetailContext.data.form.getValues().publish_start_date;
	const endDateValue = alertDetailContext.data.form.getValues().publish_end_date;
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.detail.sectionVisibility' });

	//
	// C. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					key={alertDetailContext.data.form.key('publish_start_date')}
					label={t('publish_start_date_label')}
					fullWidth
					{...alertDetailContext.data.form.getInputProps('publish_start_date')}
					value={startDateValue}
					onChange={(date) => {
						alertDetailContext.data.form.setFieldValue('publish_start_date', date);
					}}
				/>
				<DateTimePicker
					key={alertDetailContext.data.form.key('publish_end_date')}
					label={t('publish_end_date_label')}
					clearable
					fullWidth
					{...alertDetailContext.data.form.getInputProps('publish_end_date')}
					value={endDateValue}
					onChange={(date) => {
						alertDetailContext.data.form.setFieldValue('publish_end_date', date);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
