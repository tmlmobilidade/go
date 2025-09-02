'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeCreate.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/* * */

export function RealtimeDetailSectionValidity() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// B. Transform data

	const startDateValue = realtimeDetailContext.data.form.getValues().active_period_start_date;
	const endDateValue = realtimeDetailContext.data.form.getValues().active_period_end_date;

	const startDate = new Date(startDateValue);
	const endDate = endDateValue ? new Date(endDateValue) : null;

	//
	// C. Render components

	return (
		<Collapsible
			description="Período em que o realtimea é válido. Distinto da visibilidade. O realtimea pode estar visível mas não ser ainda válido (ex: um realtimea para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias)."
			title="Período de Vigência"
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					className={styles.datePicker}
					description="Data de início do realtimea"
					label="Data de Início"
					{...realtimeDetailContext.data.form.getInputProps('active_period_start_date')}
					value={startDate}
					onChange={(date) => {
						realtimeDetailContext.data.form.setFieldValue('active_period_start_date', Dates.fromFormat(date, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp);
					}}
				/>
				<DateTimePicker
					className={styles.datePicker}
					description="Data de fim do realtimea"
					label="Data de Fim"
					clearable
					{...realtimeDetailContext.data.form.getInputProps('active_period_end_date')}
					value={endDate}
					onChange={(date) => {
						realtimeDetailContext.data.form.setFieldValue('active_period_end_date', date ? Dates.fromFormat(date, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp : null);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
