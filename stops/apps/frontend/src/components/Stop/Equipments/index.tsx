'use client';

/* * */

import Header from '@/components/common/Header';
import Item from '@/components/common/Row/Item';
import { Grid } from '@tmlmobilidade/ui';

/* * */

import { Facilities } from '@tmlmobilidade/types';

import styles from '../styles.module.css';

/* * */

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
interface EquipmentsProps {
	facilities: object
}
export default function Equipments({ facilities }: EquipmentsProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Quais são os equipamentos que esta paragem serve."
				title="Equipamentos Servidos"
			/>

			<Grid className={styles.grid} columns="abcd">
				{/* <Item
					inputProps={facilities}
					isBoolean={true}
					label={FacilitiesValues[HEALTH_CLINIC]}
				/> */}
				{/* value={facilities.includes(HEALTH_CLINIC)} */}
				{/* <Item
					inputProps={facilities}
					isBoolean={true}
					label={FacilitiesValues[HOSPITAL]}
				/> */}
				{/* value={facilities.includes(HOSPITAL)} */}
				{/* <Item label={FacilitiesValues[UNIVERSITY]} value={facilities.includes(UNIVERSITY)} />
				<Item label={FacilitiesValues[SCHOOL]} value={facilities.includes(SCHOOL)} />

				<Item label={FacilitiesValues[POLICE_STATION]} value={facilities.includes(POLICE_STATION)} />
				<Item label={FacilitiesValues[FIRE_STATION]} value={facilities.includes(FIRE_STATION)} />
				<Item label={FacilitiesValues[SHOPPING]} value={facilities.includes(SHOPPING)} />
				<Item label={FacilitiesValues[HISTORIC_BUILDING]} value={facilities.includes(HISTORIC_BUILDING)} />

				<Item label={FacilitiesValues[TRANSIT_OFFICE]} value={facilities.includes(TRANSIT_OFFICE)} />
				<Item label={FacilitiesValues[PIP]} value={facilities.includes(PIP)} /> */}
			</Grid>
		</div>
	);
}
