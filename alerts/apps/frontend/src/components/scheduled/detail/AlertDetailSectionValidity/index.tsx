'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

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

	const startDate = new Date(startDateValue);
	const endDate = endDateValue ? new Date(endDateValue) : null;

	//
	// C. Render components

	return (
		<Collapsible
			description="Período em que o alerta é válido. Distinto da visibilidade. O alerta pode estar visível mas não ser ainda válido (ex: um alerta para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias)."
			title="Período de Vigência"
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					className={styles.datePicker}
					description="Data de início do alerta"
					label="Data de Início"
					{...alertDetailContext.data.form.getInputProps('active_period_start_date')}
					value={startDate}
					onChange={(date) => {
						alertDetailContext.data.form.setFieldValue('active_period_start_date', Dates.fromFormat(date, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp);
					}}
				/>
				<DateTimePicker
					className={styles.datePicker}
					description="Data de fim do alerta"
					label="Data de Fim"
					clearable
					{...alertDetailContext.data.form.getInputProps('active_period_end_date')}
					value={endDate}
					onChange={(date) => {
						alertDetailContext.data.form.setFieldValue('active_period_end_date', date ? Dates.fromFormat(date, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp : null);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
