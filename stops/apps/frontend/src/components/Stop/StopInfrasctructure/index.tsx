'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { Collapsible, DateTimePicker, Grid, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function StopInfrasctructure() {
	//

	const stopsDetailContext = useStopsDetailContext();

	//
	// A. Render components

	return (
		<Collapsible
			description="Informações relacionadas com os equipamentos da paragem e envolvente."
			title="Infraestrutura"
		>
			<Section gap="md">
				<Grid columns="ab" gap="md">
					<DateTimePicker
						label="Última Manutenção da Infraestrutura"
						placeholder="2023-02-10"
						{...stopsDetailContext.data.form.getInputProps('last_infrastructure_check')}
						value={new Date(stopsDetailContext.data.form.getValues().last_infrastructure_check)}
						onChange={(date) => {
							const formattedDate = new Date(date);
							stopsDetailContext.data.form.setFieldValue('last_infrastructure_check', Dates.fromJSDate(formattedDate).unix_timestamp);
						}}
					/>

					<DateTimePicker
						label="Última Verificação da Infraestrutura"
						placeholder="2023-02-10"
						{...stopsDetailContext.data.form.getInputProps('last_infrastructure_maintenance')}
						value={new Date(stopsDetailContext.data.form.getValues().last_infrastructure_maintenance)}
						onChange={(date) => {
							const formattedDate = new Date(date);
							stopsDetailContext.data.form.setFieldValue('last_infrastructure_maintenance', Dates.fromJSDate(formattedDate).unix_timestamp);
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
