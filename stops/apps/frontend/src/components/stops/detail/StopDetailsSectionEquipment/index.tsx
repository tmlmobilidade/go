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
					<StopDetailFacilityCheckbox label="Clínica" value="health_clinic" />
					<StopDetailFacilityCheckbox label="Hospital" value="hospital" />
					<StopDetailFacilityCheckbox label="Universidade" value="university" />
					<StopDetailFacilityCheckbox label="Escola" value="school" />
					<StopDetailFacilityCheckbox label="Esquadra" value="police_station" />
					<StopDetailFacilityCheckbox label="Bombeiros" value="fire_station" />
					<StopDetailFacilityCheckbox label="Zona Comercial" value="commercial_area" />
					<StopDetailFacilityCheckbox label="Centro Comercial" value="shopping" />
					<StopDetailFacilityCheckbox label="Edifício Histórico" value="historic_building" />
					<StopDetailFacilityCheckbox label="Espaço navegante®" value="transit_office" />
					<StopDetailFacilityCheckbox label="Praia" value="beach" />
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
