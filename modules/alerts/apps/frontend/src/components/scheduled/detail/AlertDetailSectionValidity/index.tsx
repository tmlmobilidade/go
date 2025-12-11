'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';

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

	//
	// C. Render components

	return (
		<Collapsible
			description="Período em que o alerta é válido. Distinto da visibilidade. O alerta pode estar visível mas não ser ainda válido (ex: um alerta para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias)."
			title="Período de Vigência"
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					key={alertDetailContext.data.form.key('active_period_start_date')}
					label="Data de Início"
					fullWidth
					{...alertDetailContext.data.form.getInputProps('active_period_start_date')}
					value={startDateValue}
					onChange={(date) => {
						alertDetailContext.data.form.setFieldValue('active_period_start_date', date);
					}}
				/>
				<DateTimePicker
					key={alertDetailContext.data.form.key('active_period_end_date')}
					label="Data de Fim"
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
