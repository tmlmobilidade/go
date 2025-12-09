'use client';

/* * */

import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateSectionVisibility() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Transform data

	const startDateValue = alertCreateContext.data.form.getValues().publish_start_date;
	const endDateValue = alertCreateContext.data.form.getValues().publish_end_date;

	//
	// C. Render components

	return (
		<Collapsible
			description="É possível agendar a permanência do alerta nos canais digitais. A visibilidade do alerta é diferente do seu período de vigência."
			title="Visibilidade e Agendamento"
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					label="Data de Início"
					fullWidth
					{...alertCreateContext.data.form.getInputProps('publish_start_date')}
					value={startDateValue}
					onChange={(date) => {
						alertCreateContext.data.form.setFieldValue('publish_start_date', date);
					}}
				/>
				<DateTimePicker
					label="Data de Fim"
					clearable
					fullWidth
					{...alertCreateContext.data.form.getInputProps('publish_end_date')}
					value={endDateValue}
					onChange={(date) => {
						alertCreateContext.data.form.setFieldValue('publish_end_date', date);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
