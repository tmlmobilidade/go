'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { Collapsible, DateTimePicker, Grid, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function StopPublicInformation() {
	//

	//
	// A. Setup variables
	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render components
	return (
		<Collapsible
			description="Informações relacionadas com os suportes de informação ao público."
			title="Informação ao Público"
		>
			<Section gap="md">
				<Grid columns="ab" gap="md">
					<DateTimePicker
						label="Última Manutenção dos Horários"
						placeholder="2023-02-10"
						{...stopsDetailContext.data.form.getInputProps('last_schedules_maintenance')}
						value={new Date(stopsDetailContext.data.form.getValues().last_schedules_maintenance)}
						onChange={(date) => {
							const formattedDate = new Date(date);
							stopsDetailContext.data.form.setFieldValue('last_schedules_maintenance', Dates.fromJSDate(formattedDate).unix_timestamp);
						}}
					/>

					<DateTimePicker
						label="Última Verificação dos Horários"
						placeholder="2023-02-10"
						{...stopsDetailContext.data.form.getInputProps('last_schedules_check')}
						value={new Date(stopsDetailContext.data.form.getValues().last_schedules_check)}
						onChange={(date) => {
							const formattedDate = new Date(date);
							stopsDetailContext.data.form.setFieldValue('last_schedules_check', Dates.fromJSDate(formattedDate).unix_timestamp);
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
