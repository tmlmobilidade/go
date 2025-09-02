'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/* * */

export function RealtimeDetailSectionVisibility() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// B. Transform data

	const startDateValue = realtimeDetailContext.data.form.getValues().publish_start_date;
	const endDateValue = realtimeDetailContext.data.form.getValues().publish_end_date;

	const startDate = new Date(startDateValue);
	const endDate = endDateValue ? new Date(endDateValue) : null;

	//
	// C. Render components

	return (
		<Collapsible
			description="É possível agendar a permanência do realtimea nos canais digitais. A visibilidade do realtimea é diferente do seu período de vigência."
			title="Visibilidade e Agendamento"
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					className={styles.datePicker}
					description="Data de início do realtimea"
					label="Data de Início"
					{...realtimeDetailContext.data.form.getInputProps('publish_start_date')}
					value={startDate}
					onChange={(date) => {
						realtimeDetailContext.data.form.setFieldValue('publish_start_date', Dates.fromFormat(date, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp);
					}}
				/>
				<DateTimePicker
					className={styles.datePicker}
					description="Data de fim do realtimea"
					label="Data de Fim"
					clearable
					{...realtimeDetailContext.data.form.getInputProps('publish_end_date')}
					value={endDate}
					onChange={(date) => {
						realtimeDetailContext.data.form.setFieldValue('publish_end_date', date ? Dates.fromFormat(date, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp : null);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
