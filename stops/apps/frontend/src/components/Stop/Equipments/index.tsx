'use client';

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

	//
	// B. Render components

	return (
		<Collapsible
			description="Quais são os equipamentos que esta paragem serve."
			title="Equipamentos Servidos"
		>
			<Section gap="md">
				<Grid columns="abcd" gap="md">
					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('facilities').value.includes(HEALTH_CLINIC)}
							className={styles.input_checkbox}
							label={FacilitiesValues[HEALTH_CLINIC]}
							{...stopDetailContext.data.form.getInputProps('facilities')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('facilities').value.includes(HOSPITAL)}
							className={styles.input_checkbox}
							label={FacilitiesValues[HOSPITAL]}
							{...stopDetailContext.data.form.getInputProps('facilities')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('facilities').value.includes(UNIVERSITY)}
							className={styles.input_checkbox}
							label={FacilitiesValues[UNIVERSITY]}
							{...stopDetailContext.data.form.getInputProps('facilities')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('facilities').value.includes(SCHOOL)}
							className={styles.input_checkbox}
							label={FacilitiesValues[SCHOOL]}
							{...stopDetailContext.data.form.getInputProps('facilities')}
						/>
					</div>
				</Grid>
				<Grid columns="abcd" gap="md">
					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('facilities').value.includes(POLICE_STATION)}
							className={styles.input_checkbox}
							label={FacilitiesValues[POLICE_STATION]}
							{...stopDetailContext.data.form.getInputProps('facilities')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('facilities').value.includes(FIRE_STATION)}
							className={styles.input_checkbox}
							label={FacilitiesValues[FIRE_STATION]}
							{...stopDetailContext.data.form.getInputProps('facilities')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('facilities').value.includes(SHOPPING)}
							className={styles.input_checkbox}
							label={FacilitiesValues[SHOPPING]}
							{...stopDetailContext.data.form.getInputProps('facilities')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('facilities').value.includes(HISTORIC_BUILDING)}
							className={styles.input_checkbox}
							label={FacilitiesValues[HISTORIC_BUILDING]}
							{...stopDetailContext.data.form.getInputProps('facilities')}
						/>
					</div>
				</Grid>

				<Grid columns="abcd" gap="md">
					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={facilities.value.includes(TRANSIT_OFFICE)}
							className={styles.input_checkbox}
							label={FacilitiesValues[TRANSIT_OFFICE]}
							{...stopDetailContext.data.form.getInputProps('facilities')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={facilities.value.includes(PIP)}
							className={styles.input_checkbox}
							label={FacilitiesValues[PIP]}
							{...stopDetailContext.data.form.getInputProps('facilities')}
						/>
					</div>
				</Grid>
			</Section>
		</Collapsible>
	);
}
