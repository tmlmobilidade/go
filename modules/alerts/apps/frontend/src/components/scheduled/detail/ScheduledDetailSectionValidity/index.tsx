'use client';

/* * */

import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { Collapsible, DateTimeInput, DateTimePicker, Section } from '@tmlmobilidade/ui';

/* * */

export function ScheduledDetailSectionValidity() {
	//

	//
	// A. Setup variables

	const scheduledDetailContext = useScheduledDetailContext();

	//
	// B. Transform data

	const startDateValue = scheduledDetailContext.data.form.getValues().active_period_start_date;
	const endDateValue = scheduledDetailContext.data.form.getValues().active_period_end_date;

	//
	// C. Render components

	return (
		<Collapsible
			description="Período em que o alerta é válido. Distinto da visibilidade. O alerta pode estar visível mas não ser ainda válido (ex: um alerta para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias)."
			title="Período de Vigência"
			defaultOpen
		>
			<Section flexDirection="row" gap="md">
				<DateTimeInput
					key={scheduledDetailContext.data.form.key('active_period_start_date')}
					label="Data de Início"
					{...scheduledDetailContext.data.form.getInputProps('active_period_start_date')}
				/>
				<DateTimeInput
					key={scheduledDetailContext.data.form.key('active_period_end_date')}
					label="Data de Fim"
					clearable
					{...scheduledDetailContext.data.form.getInputProps('active_period_end_date')}
				/>
				{/* <DateTimePicker
					key={scheduledDetailContext.data.form.key('active_period_start_date')}
					label="Data de Início"
					fullWidth
					{...scheduledDetailContext.data.form.getInputProps('active_period_start_date')}
				/>
				<DateTimePicker
					key={scheduledDetailContext.data.form.key('active_period_end_date')}
					label="Data de Fim"
					clearable
					fullWidth
					{...scheduledDetailContext.data.form.getInputProps('active_period_end_date')}
				/> */}
			</Section>
		</Collapsible>
	);

	//
}
