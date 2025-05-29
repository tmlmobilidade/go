'use client';

import { Collapsible, DateTimePicker, Grid, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function StopPublicInformation({ data }) {
	//
	// A. Render components

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
						{...data.form.getInputProps('last_schedules_maintenance')}
						value={new Date(data.form.getValues().last_schedules_maintenance)}
						onChange={(date) => {
							const formattedDate = new Date(date);
							data.form.setFieldValue('last_schedules_maintenance', Dates.fromJSDate(formattedDate).unix_timestamp);
						}}
					/>

					<DateTimePicker
						label="Última Verificação dos Horários"
						placeholder="2023-02-10"
						{...data.form.getInputProps('last_schedules_check')}
						value={new Date(data.form.getValues().last_schedules_check)}
						onChange={(date) => {
							const formattedDate = new Date(date);
							data.form.setFieldValue('last_schedules_check', Dates.fromJSDate(formattedDate).unix_timestamp);
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
