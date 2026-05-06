'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { ParameterCreateDayPeriod } from '@/components/patterns/shape/parameters/create/ParameterCreateDayPeriod';
import { ParameterCreateTable } from '@/components/patterns/shape/parameters/create/ParameterCreateTable';
import { ParameterCreateVehicleType } from '@/components/patterns/shape/parameters/create/ParameterCreateVehicleType';
import { ParameterCreateWeekdays } from '@/components/patterns/shape/parameters/create/ParameterCreateWeekdays';
import { ParameterCreateYearPeriods } from '@/components/patterns/shape/parameters/create/ParameterCreateYearPeriods';
import { Divider, Section, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function ParameterCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const createParameterContext = useParameterCreateContext();

	const isDefaultRule = createParameterContext.data.form?.values.kind === 'default';

	//
	// B. Render components

	return (
		<Section gap="md">

			{/* Parameter Type */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">1. Quais os parâmetros que vão ser aplicados?</Text>
				<ParameterCreateTable />
			</div>

			<Divider />

			{/* Vehicle Type */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">2. Que tipo de veículo deve realizar esta viagem?</Text>
				<ParameterCreateVehicleType />
			</div>

			{/* Parameter Conditions */}
			{!isDefaultRule && (
				<>
					<Divider />

					<div className={styles.sectionWrapper}>
						<Text size="lg">3. Quando devem estes parâmetros aplicar-se?</Text>
						<Text c="dimmed" size="sm">Estes parâmetros aplicam-se quando TODAS as condições abaixo se verificam</Text>

						<ParameterCreateYearPeriods />
						<Divider />
						<ParameterCreateWeekdays />
						<Divider />
						<ParameterCreateDayPeriod />
					</div>
				</>

			)}

		</Section>
	);

	//
}
