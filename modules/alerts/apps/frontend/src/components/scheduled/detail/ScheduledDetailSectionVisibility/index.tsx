'use client';

/* * */

import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { Collapsible, DateTimePicker, Section } from '@tmlmobilidade/ui';

/* * */

export function ScheduledDetailSectionVisibility() {
	//

	//
	// A. Setup variables

	const scheduledDetailContext = useScheduledDetailContext();

	//
	// B. Transform data

	const startDateValue = scheduledDetailContext.data.form.getValues().publish_start_date;
	const endDateValue = scheduledDetailContext.data.form.getValues().publish_end_date;

	//
	// C. Render components

	return (
		<Collapsible
			description="É possível agendar a permanência do alerta nos canais digitais. A visibilidade do alerta é diferente do seu período de vigência."
			title="Visibilidade e Agendamento"
		>
			<Section flexDirection="row" gap="md">
				<DateTimePicker
					key={scheduledDetailContext.data.form.key('publish_start_date')}
					label="Data de Início"
					fullWidth
					{...scheduledDetailContext.data.form.getInputProps('publish_start_date')}
					value={startDateValue}
					onChange={(date) => {
						scheduledDetailContext.data.form.setFieldValue('publish_start_date', date);
					}}
				/>
				<DateTimePicker
					key={scheduledDetailContext.data.form.key('publish_end_date')}
					label="Data de Fim"
					clearable
					fullWidth
					{...scheduledDetailContext.data.form.getInputProps('publish_end_date')}
					value={endDateValue}
					onChange={(date) => {
						scheduledDetailContext.data.form.setFieldValue('publish_end_date', date);
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
