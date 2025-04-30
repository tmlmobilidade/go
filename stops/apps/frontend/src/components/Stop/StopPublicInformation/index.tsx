'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Collapsible, DateTimePicker, Grid, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export default function PublicInformation() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

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
						{...stopDetailContext.data.form.getInputProps('last_schedules_maintenance')}
						value={new Date(stopDetailContext.data.form.getValues().last_schedules_maintenance)}
						onChange={(date) => {
							stopDetailContext.data.form.setFieldValue('last_schedules_maintenance', Dates.fromJSDate(date).unix_timestamp);
						}}
					/>

					<DateTimePicker
						label="Última Verificação dos Horários"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_schedules_check')}
						value={new Date(stopDetailContext.data.form.getValues().last_schedules_check)}
						onChange={(date) => {
							stopDetailContext.data.form.setFieldValue('last_schedules_check', Dates.fromJSDate(date).unix_timestamp);
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
