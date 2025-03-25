'use client';

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { DateTimePicker, Section, Surface } from '@tmlmobilidade/ui';
import { getUnixTimestampFromJSDate } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

export default function AlertSectionValidity() {
	const { data: alertDetailData } = useAlertDetailContext();

	const startDateValue = alertDetailData.form.getValues().active_period_start_date;
	const endDateValue = alertDetailData.form.getValues().active_period_end_date;

	const startDate = new Date(startDateValue);
	const endDate = endDateValue ? new Date(endDateValue) : null;

	return (
		<Section
			description="Período em que o alerta é válido. Distinto da visibilidade. O alerta pode estar visível mas não ser ainda válido (ex: um alerta para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias)."
			title="Período de Vigência"
		>
			<Surface flexDirection="row" gap="md" padding="sm">
				<DateTimePicker
					className={styles.datePicker}
					description="Data de início do alerta"
					label="Data de Início"
					{...alertDetailData.form.getInputProps('active_period_start_date')}
					value={startDate}
					onChange={(date) => {
						alertDetailData.form.setFieldValue('active_period_start_date', getUnixTimestampFromJSDate(date));
					}}
				/>
				<DateTimePicker
					className={styles.datePicker}
					description="Data de fim do alerta"
					label="Data de Fim"
					clearable
					{...alertDetailData.form.getInputProps('active_period_end_date')}
					value={endDate}
					onChange={(date) => {
						alertDetailData.form.setFieldValue('active_period_end_date', getUnixTimestampFromJSDate(date));
					}}
				/>
			</Surface>
		</Section>
	);
}
