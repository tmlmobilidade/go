'use client';

import Item from '@/components/common/Row/Item';
import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Checkbox, Collapsible, Grid, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export default function Equipments() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const FIRE_STATION = 'fire_station';
	const HEALTH_CLINIC = 'health_clinic';
	const HISTORIC_BUILDING = 'historic_building';
	const HOSPITAL = 'hospital';
	const PIP = 'pip';
	const POLICE_STATION = 'police_station';
	const SCHOOL = 'school';
	const SHOPPING = 'shopping';
	const TRANSIT_OFFICE = 'transit_office';
	const UNIVERSITY = 'university';

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

	const facilities = stopDetailContext.data.form.getInputProps('facilities');
	console.log('=> facilities', facilities);
	//

	//
	// A. Render components

	return (
		<Collapsible
			description="Quais são os equipamentos que esta paragem serve."
			title="Equipamentos Servidos"
		>
			<Section gap="md">
				<Grid columns="abcd" gap="md">
					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={facilities.value.includes(HEALTH_CLINIC)}
							className={styles.input_checkbox}
							label={FacilitiesValues[HEALTH_CLINIC]}
							{...facilities}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Item
							checked={facilities.value.includes(HOSPITAL)}
							className={styles.input_checkbox}
							label={FacilitiesValues[HOSPITAL]}
							{...facilities}
						/>
					</div>

					{/* <Item
						isBoolean={true}
						label={FacilitiesValues[UNIVERSITY]}
						value={facilities.includes(UNIVERSITY)}
					/>
					<Item
						isBoolean={true}
						label={FacilitiesValues[SCHOOL]}
						value={facilities.includes(SCHOOL)}
					/> */}

				</Grid>
				{/* <Grid columns="abcd" gap="md">
					<Item label={FacilitiesValues[POLICE_STATION]} value={facilities.includes(POLICE_STATION)} />
					<Item label={FacilitiesValues[FIRE_STATION]} value={facilities.includes(FIRE_STATION)} />
					<Item label={FacilitiesValues[SHOPPING]} value={facilities.includes(SHOPPING)} />
					<Item label={FacilitiesValues[HISTORIC_BUILDING]} value={facilities.includes(HISTORIC_BUILDING)} />
				</Grid>
				<Grid columns="ab" gap="md">
					<Item label={FacilitiesValues[TRANSIT_OFFICE]} value={facilities.includes(TRANSIT_OFFICE)} />
					<Item label={FacilitiesValues[PIP]} value={facilities.includes(PIP)} />
				</Grid> */}
			</Section>
		</Collapsible>
	);
}
