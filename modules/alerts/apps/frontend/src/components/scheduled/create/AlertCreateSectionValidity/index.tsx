'use client';

/* * */

import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateSectionValidity() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Transform data

	const startDateValue = alertCreateContext.data.form.getValues().active_period_start_date;
	const endDateValue = alertCreateContext.data.form.getValues().active_period_end_date;

	//
	// C. Render components

	return (
		<Collapsible
			description="Período em que o alerta é válido. Distinto da visibilidade. O alerta pode estar visível mas não ser ainda válido (ex: um alerta para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias)."
			title="Período de Vigência"
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					label="Data de Início"
					fullWidth
					{...alertCreateContext.data.form.getInputProps('active_period_start_date')}
					value={startDateValue}
					onChange={(date) => {
						alertCreateContext.data.form.setFieldValue('active_period_start_date', date);
					}}
				/>
				<DateTimePicker
					label="Data de Fim"
					clearable
					fullWidth
					{...alertCreateContext.data.form.getInputProps('active_period_end_date')}
					value={endDateValue}
					onChange={(date) => {
						alertCreateContext.data.form.setFieldValue('active_period_end_date', date);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
