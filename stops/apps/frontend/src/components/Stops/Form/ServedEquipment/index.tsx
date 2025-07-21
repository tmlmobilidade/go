'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Checkbox, Collapsible, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function ServedEquipment() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Quais são os equipamentos que esta paragem serve."
			title="Equipamentos Servidos"
		>
			<Section>
				<Grid columns="abcd" gap="md">
					<Checkbox
						label="Clínica"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Hopital"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Universidade"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Escola"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Esquadra"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Bombeiros"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Zona Comercial"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Edifício Histórico"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Espaço navegante®"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Checkbox
						label="Praia"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
