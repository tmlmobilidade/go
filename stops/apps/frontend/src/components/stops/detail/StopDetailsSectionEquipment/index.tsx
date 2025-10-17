'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { ScopeOption } from '@/types/proposed-changes';
import { Checkbox, Collapsible, Grid, ProposedChangesWrapper, Section } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionEquipment() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const scopeOption: ScopeOption = 'stop';

	//
	// B. Render components

	return (
		<Collapsible
			description="Quais são os equipamentos que esta paragem serve."
			title="Equipamentos Servidos"
		>
			<Section>
				<Grid columns="abcd" gap="md">

					<ProposedChangesWrapper
						inputName="health_clinic"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<Checkbox
							label="Clínica"
							{...stopDetailContext.data.form.getInputProps('near_health_clinic')}
						/>
					</ProposedChangesWrapper>

					<ProposedChangesWrapper
						inputName="hospital"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<Checkbox
							label="Hospital"
							{...stopDetailContext.data.form.getInputProps('near')}
						/>
					</ProposedChangesWrapper>

					<Checkbox
						label="Universidade"
						{...stopDetailContext.data.form.getInputProps('near_university')}
					/>
					<Checkbox
						label="Escola"
						{...stopDetailContext.data.form.getInputProps('near_school')}
					/>
					<Checkbox
						label="Esquadra"
						{...stopDetailContext.data.form.getInputProps('near_police_station')}
					/>
					<Checkbox
						label="Bombeiros"
						{...stopDetailContext.data.form.getInputProps('near_fire_station')}
					/>
					<Checkbox
						label="Zona Comercial"
						{...stopDetailContext.data.form.getInputProps('near_shopping')}
					/>
					<Checkbox
						label="Edifício Histórico"
						{...stopDetailContext.data.form.getInputProps('near_historic_building')}
					/>
					<Checkbox
						label="Espaço navegante®"
						{...stopDetailContext.data.form.getInputProps('near_transit_office')}
					/>
					<Checkbox
						label="Praia"
						{...stopDetailContext.data.form.getInputProps('near_beach')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
