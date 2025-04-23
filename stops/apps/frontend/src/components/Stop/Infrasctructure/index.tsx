'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Collapsible, DateTimePicker, Grid, Section } from '@tmlmobilidade/ui';
import { getUnixTimestampFromJSDate } from '@tmlmobilidade/utils';

/* * */

export default function Infrasctructure() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

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
						{...stopDetailContext.data.form.getInputProps('last_infrastructure_check')}
						value={new Date(stopDetailContext.data.form.getValues().last_infrastructure_check)}
						onChange={(date) => {
							stopDetailContext.data.form.setFieldValue('last_infrastructure_check', getUnixTimestampFromJSDate(date));
						}}
					/>

					<DateTimePicker
						label="Última Verificação da Infraestrutura"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_infrastructure_maintenance')}
						value={new Date(stopDetailContext.data.form.getValues().last_infrastructure_maintenance)}
						onChange={(date) => {
							stopDetailContext.data.form.setFieldValue('last_infrastructure_maintenance', getUnixTimestampFromJSDate(date));
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
