'use client';

/* * */

import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { Collapsible, DateTimeInput, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function ScheduledDetailSectionVisibility() {
	//

	//
	// A. Setup variables

	const scheduledDetailContext = useScheduledDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="É possível agendar a permanência do alerta nos canais digitais. A visibilidade do alerta é diferente do seu período de vigência."
			title="Visibilidade e Agendamento"
		>
			<Section>
				<Grid columns="ab" gap="md">
					<DateTimeInput
						key={scheduledDetailContext.data.form.key('publish_start_date')}
						label="Data de Início"
						{...scheduledDetailContext.data.form.getInputProps('publish_start_date')}
					/>
					<DateTimeInput
						key={scheduledDetailContext.data.form.key('publish_end_date')}
						label="Data de Fim"
						clearable
						{...scheduledDetailContext.data.form.getInputProps('publish_end_date')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
