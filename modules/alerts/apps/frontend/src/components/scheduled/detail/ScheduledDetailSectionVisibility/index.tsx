'use client';

/* * */

import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';

/* * */

export function ScheduledDetailSectionVisibility() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useScheduledDetailContext();

	//
	// B. Transform data

	const startDateValue = alertDetailContext.data.form.getValues().publish_start_date;
	const endDateValue = alertDetailContext.data.form.getValues().publish_end_date;

	//
	// C. Render components

	return (
		<Collapsible
			description="É possível agendar a permanência do alerta nos canais digitais. A visibilidade do alerta é diferente do seu período de vigência."
			title="Visibilidade e Agendamento"
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					key={alertDetailContext.data.form.key('publish_start_date')}
					label="Data de Início"
					fullWidth
					{...alertDetailContext.data.form.getInputProps('publish_start_date')}
					value={startDateValue}
					onChange={(date) => {
						alertDetailContext.data.form.setFieldValue('publish_start_date', date);
					}}
				/>
				<DateTimePicker
					key={alertDetailContext.data.form.key('publish_end_date')}
					label="Data de Fim"
					clearable
					fullWidth
					{...alertDetailContext.data.form.getInputProps('publish_end_date')}
					value={endDateValue}
					onChange={(date) => {
						alertDetailContext.data.form.setFieldValue('publish_end_date', date);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
