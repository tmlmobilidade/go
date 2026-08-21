'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Checkbox, Collapsible, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionConnections() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Quais são os outros modos de transporte, para além do autocarro, que esta paragem serve."
			title="Ligações Intermodais"
		>
			<Section>
				<Grid columns="abcd" gap="md">
					<Checkbox
						label="Metro"
						{...stopDetailContext.data.form.getInputProps('near_subway')}
					/>
					<Checkbox
						label="Metro de Superfície"
						{...stopDetailContext.data.form.getInputProps('near_light_rail')}
					/>
					<Checkbox
						label="Comboio"
						{...stopDetailContext.data.form.getInputProps('near_train')}
					/>
					<Checkbox
						label="Barco"
						{...stopDetailContext.data.form.getInputProps('near_boat')}
					/>
					<Checkbox
						label="Aeroporto"
						{...stopDetailContext.data.form.getInputProps('near_airport')}
					/>
					<Checkbox
						label="Partilha de Bicicletas"
						{...stopDetailContext.data.form.getInputProps('near_bike_sharing')}
					/>
					<Checkbox
						label="Estacionamento de Bicicletas"
						{...stopDetailContext.data.form.getInputProps('neawr_bike_parking')}
					/>
					<Checkbox
						label="Estacionamento de Automóveis"
						{...stopDetailContext.data.form.getInputProps('near_car_parking')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
