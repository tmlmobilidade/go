'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Checkbox, Collapsible, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function IntermodalConnections() {
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
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Metro de Superfície"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Comboio"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Barco"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Aeroporto"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Partilha de Bicicletas"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Estacionamento de Bicicletas"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Estacionamento de Automóveis"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
