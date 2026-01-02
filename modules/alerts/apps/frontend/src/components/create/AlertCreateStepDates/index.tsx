'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { DateTimeInput, Divider, Grid, Label, Section, Text } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateStepDates() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Render components

	return (
		<>

			<Section gap="sm">
				<Label size="lg" caps>Período de Vigência</Label>
				<Text size="sm" weight="medium">Período em que o alerta é válido. Distinto da visibilidade. O alerta pode estar visível mas não ser ainda válido (ex: um alerta para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias).</Text>
				<Grid columns="ab" gap="md">
					<DateTimeInput
						key={alertCreateContext.data.form.key('active_period_start_date')}
						label="Data de Início"
						{...alertCreateContext.data.form.getInputProps('active_period_start_date')}
					/>
					<DateTimeInput
						key={alertCreateContext.data.form.key('active_period_end_date')}
						label="Data de Fim"
						clearable
						{...alertCreateContext.data.form.getInputProps('active_period_end_date')}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section gap="sm">
				<Label size="lg" caps>Agendamento</Label>
				<Text size="sm" weight="medium">É possível agendar a permanência do alerta nos canais digitais. A visibilidade do alerta é diferente do seu período de vigência.</Text>
				<Grid columns="ab" gap="md">
					<DateTimeInput
						key={alertCreateContext.data.form.key('publish_start_date')}
						label="Data de Início"
						{...alertCreateContext.data.form.getInputProps('publish_start_date')}
					/>
					<DateTimeInput
						key={alertCreateContext.data.form.key('publish_end_date')}
						label="Data de Fim"
						clearable
						{...alertCreateContext.data.form.getInputProps('publish_end_date')}
					/>
				</Grid>
			</Section>

		</>
	);
}
