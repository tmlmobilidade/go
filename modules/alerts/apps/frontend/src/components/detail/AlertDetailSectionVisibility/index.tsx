'use client';

/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { Collapsible, DateTimeInput, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function AlertDetailSectionVisibility() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

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
						key={alertDetailContext.data.form.key('publish_start_date')}
						label="Data de Início"
						{...alertDetailContext.data.form.getInputProps('publish_start_date')}
					/>
					<DateTimeInput
						key={alertDetailContext.data.form.key('publish_end_date')}
						label="Data de Fim"
						clearable
						{...alertDetailContext.data.form.getInputProps('publish_end_date')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
