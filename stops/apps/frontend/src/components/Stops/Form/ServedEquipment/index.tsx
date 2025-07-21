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
						checked={stopDetailContext.data.form.getInputProps('near_health_clinic').value === 'true'}
						label="Clínica"
						{...stopDetailContext.data.form.getInputProps('near_health_clinic')}
					/>
					<Checkbox
						checked={stopDetailContext.data.form.getInputProps('near_hospital').value === 'true'}
						label="Hopital"
						{...stopDetailContext.data.form.getInputProps('near_hospital')}
					/>
					<Checkbox
						checked={stopDetailContext.data.form.getInputProps('near_university').value === 'true'}
						label="Universidade"
						{...stopDetailContext.data.form.getInputProps('near_university')}
					/>
					<Checkbox
						checked={stopDetailContext.data.form.getInputProps('near_school').value === 'true'}
						label="Escola"
						{...stopDetailContext.data.form.getInputProps('near_school')}
					/>
					<Checkbox
						checked={stopDetailContext.data.form.getInputProps('near_police_station').value === 'true'}
						label="Esquadra"
						{...stopDetailContext.data.form.getInputProps('near_police_station')}
					/>
					<Checkbox
						checked={stopDetailContext.data.form.getInputProps('near_fire_station').value === 'true'}
						label="Bombeiros"
						{...stopDetailContext.data.form.getInputProps('near_fire_station')}
					/>
					<Checkbox
						checked={stopDetailContext.data.form.getInputProps('near_shopping').value === 'true'}
						label="Zona Comercial"
						{...stopDetailContext.data.form.getInputProps('near_shopping')}
					/>
					<Checkbox
						checked={stopDetailContext.data.form.getInputProps('near_historic_building').value === 'true'}
						label="Edifício Histórico"
						{...stopDetailContext.data.form.getInputProps('near_historic_building')}
					/>
					<Checkbox
						checked={stopDetailContext.data.form.getInputProps('near_transit_office').value === 'true'}
						label="Espaço navegante®"
						{...stopDetailContext.data.form.getInputProps('near_transit_office')}
					/>
					<Checkbox
						checked={stopDetailContext.data.form.getInputProps('').value === 'true'}
						label="Praia"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
