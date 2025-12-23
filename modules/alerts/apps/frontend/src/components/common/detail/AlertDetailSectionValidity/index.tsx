'use client';

/* * */

import { useAlertDetailContext } from '@/components/common/detail/AlertDetail.context';
import { Collapsible, DateTimeInput, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function AlertDetailSectionValidity() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Período em que o alerta é válido. Distinto da visibilidade. O alerta pode estar visível mas não ser ainda válido (ex: um alerta para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias)."
			title="Período de Vigência"
		>
			<Section>
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
		</Collapsible>
	);

	//
}
