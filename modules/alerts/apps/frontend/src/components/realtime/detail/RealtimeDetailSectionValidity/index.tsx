'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { Collapsible, DateTimePicker, Section } from '@go/ui';

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

	//
	// C. Render components

	return (
		<Collapsible
			description="Período em que o realtimea é válido. Distinto da visibilidade. O realtimea pode estar visível mas não ser ainda válido (ex: um realtimea para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias)."
			title="Período de Vigência"
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					label="Data de Início"
					fullWidth
					{...realtimeDetailContext.data.form.getInputProps('active_period_start_date')}
					value={startDateValue}
					onChange={(date) => {
						realtimeDetailContext.data.form.setFieldValue('active_period_start_date', date);
					}}
				/>
				<DateTimePicker
					label="Data de Fim"
					clearable
					fullWidth
					{...realtimeDetailContext.data.form.getInputProps('active_period_end_date')}
					value={endDateValue}
					onChange={(date) => {
						realtimeDetailContext.data.form.setFieldValue('active_period_end_date', date);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
