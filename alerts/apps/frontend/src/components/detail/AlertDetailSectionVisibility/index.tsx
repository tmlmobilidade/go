'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';
import { getUnixTimestampFromJSDate } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

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

	const startDate = new Date(startDateValue);
	const endDate = endDateValue ? new Date(endDateValue) : null;

	//
	// C. Render components

	return (
		<Collapsible
			description="É possível agendar a permanência do alerta nos canais digitais. A visibilidade do alerta é diferente do seu período de vigência."
			title="Visibilidade e Agendamento"
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					className={styles.datePicker}
					description="Data de início do alerta"
					label="Data de Início"
					{...alertDetailContext.data.form.getInputProps('publish_start_date')}
					value={startDate}
					onChange={(date) => {
						alertDetailContext.data.form.setFieldValue('publish_start_date', getUnixTimestampFromJSDate(date));
					}}
				/>
				<DateTimePicker
					className={styles.datePicker}
					description="Data de fim do alerta"
					label="Data de Fim"
					clearable
					{...alertDetailContext.data.form.getInputProps('publish_end_date')}
					value={endDate}
					onChange={(date) => {
						alertDetailContext.data.form.setFieldValue('publish_end_date', getUnixTimestampFromJSDate(date));
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
