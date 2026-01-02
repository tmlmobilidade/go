'use client';

/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { Collapsible, DateTimeInput, Divider, Grid, Label, Section, Text } from '@tmlmobilidade/ui';

/* * */

export function AlertDetailSectionDates() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description=""
			title="Datas de Vigência e Agendamento"
		>

			<Section gap="sm">
				<Label size="md" caps>Período de Vigência</Label>
				<Text size="sm" weight="medium">Período em que o alerta é válido. Distinto da visibilidade. O alerta pode estar visível mas não ser ainda válido (ex: um alerta para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias).</Text>
				<Grid columns="ab" gap="md">
					<DateTimeInput
						key={alertDetailContext.data.form.key('active_period_start_date')}
						label="Data de Início"
						{...alertDetailContext.data.form.getInputProps('active_period_start_date')}
					/>
					<DateTimeInput
						key={alertDetailContext.data.form.key('active_period_end_date')}
						label="Data de Fim"
						clearable
						{...alertDetailContext.data.form.getInputProps('active_period_end_date')}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section gap="sm">
				<Label size="md" caps>Agendamento</Label>
				<Text size="sm" weight="medium">É possível agendar a permanência do alerta nos canais digitais. A visibilidade do alerta é diferente do seu período de vigência.</Text>
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
