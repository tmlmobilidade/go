'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { Checkbox, Collapsible, Grid, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function StopEquipments() {
	//

	//
	// A. Setup variables
	const stopsDetailContext = useStopsDetailContext();

	const facilities = [
		'fire_station',
		'health_clinic',
		'historic_building',
		'hospital',
		'pip',
		'police_station',
		'school',
		'shopping',
		'transit_office',
		'university',
	];

	enum FacilitiesValues {
		fire_station = 'Bombeiros',
		health_clinic = 'Clínica',
		historic_building = 'Edifício Histórico',
		hospital = 'Hospital',
		pip = 'Praia',
		police_station = 'Esquadra',
		school = 'Escola',
		shopping = 'Zona Comercial',
		transit_office = 'Espaço navegante®',
		university = 'Universidade',
	}

	//
	// B. Render components
	return (
		<Collapsible
			description="Quais são os equipamentos que esta paragem serve."
			title="Equipamentos Servidos"
		>
			<Section gap="md">
				<Grid columns="abcd" gap="md">
					{facilities.map((facility, index) => {
						return (
							<div key={index} className={styles.inputCheckboxContainer}>
								<Checkbox
									checked={stopsDetailContext.data.form.getInputProps('facilities').value.includes(facility)}
									className={styles.inputCheckbox}
									label={FacilitiesValues[facility]}
									onChange={() => {
										stopsDetailContext.actions.handleFacilitiesChange(facility);
									}}
								/>
							</div>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
