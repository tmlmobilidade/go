'use client';

/* * */

import { StopDetailFacilityCheckbox } from '@/components/stops/detail/StopDetailFacilityCheckbox';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionEquipment() {
	//

	//
	// A. Render components

	return (
		<Collapsible
			description="Quais são os equipamentos que esta paragem serve."
			title="Equipamentos Servidos"
		>
			<Section>
				<Grid columns="abcd" gap="md">
					<StopDetailFacilityCheckbox label="Clínica" value="health_clinic" proposeable />
					<StopDetailFacilityCheckbox label="Hospital" value="hospital" proposeable />
					<StopDetailFacilityCheckbox label="Universidade" value="university" proposeable />
					<StopDetailFacilityCheckbox label="Escola" value="school" proposeable />
					<StopDetailFacilityCheckbox label="Esquadra" value="police_station" proposeable />
					<StopDetailFacilityCheckbox label="Bombeiros" value="fire_station" proposeable />
					<StopDetailFacilityCheckbox label="Zona Comercial" value="commercial_area" proposeable />
					<StopDetailFacilityCheckbox label="Centro Comercial" value="shopping" proposeable />
					<StopDetailFacilityCheckbox label="Edifício Histórico" value="historic_building" proposeable />
					<StopDetailFacilityCheckbox label="Espaço navegante®" value="transit_office" proposeable />
					<StopDetailFacilityCheckbox label="Praia" value="beach" proposeable />
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
