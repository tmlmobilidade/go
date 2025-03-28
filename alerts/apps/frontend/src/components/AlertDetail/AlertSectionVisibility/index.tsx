'use client';

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { DateTimePicker, Section, Surface } from '@tmlmobilidade/ui';
import { getUnixTimestampFromJSDate } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

export default function AlertSectionVisibility() {
	const { data: alertDetailData } = useAlertDetailContext();

	const startDateValue = alertDetailData.form.getValues().publish_start_date;
	const endDateValue = alertDetailData.form.getValues().publish_end_date;

	const startDate = new Date(startDateValue);
	const endDate = endDateValue ? new Date(endDateValue) : null;

	return (
		<Section
			description="É possível agendar a permanência do alerta nos canais digitais. A visibilidade do alerta é diferente do seu período de vigência."
			title="Visibilidade e Agendamento"
		>
			<Surface flexDirection="row" gap="md" padding="sm">
				<DateTimePicker
					className={styles.datePicker}
					description="Data de início do alerta"
					label="Data de Início"
					{...alertDetailData.form.getInputProps('publish_start_date')}
					value={startDate}
					onChange={(date) => {
						alertDetailData.form.setFieldValue('publish_start_date', getUnixTimestampFromJSDate(date));
					}}
				/>
				<DateTimePicker
					className={styles.datePicker}
					description="Data de fim do alerta"
					label="Data de Fim"
					clearable
					{...alertDetailData.form.getInputProps('publish_end_date')}
					value={endDate}
					onChange={(date) => {
						alertDetailData.form.setFieldValue('publish_end_date', getUnixTimestampFromJSDate(date));
					}}
				/>
			</Surface>
		</Section>
	);
}
