'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { ParameterCreateDayPeriod } from '@/components/patterns/shape/parameters/create/ParameterCreateDayPeriod';
import { ParameterCreateModifiers } from '@/components/patterns/shape/parameters/create/ParameterCreateModifiers';
import { ParameterCreateStopsList } from '@/components/patterns/shape/parameters/create/ParameterCreateStopsList';
import { ParameterCreateVehicleType } from '@/components/patterns/shape/parameters/create/ParameterCreateVehicleType';
import { ParameterCreateWeekdays } from '@/components/patterns/shape/parameters/create/ParameterCreateWeekdays';
import { ParameterCreateYearPeriods } from '@/components/patterns/shape/parameters/create/ParameterCreateYearPeriods';
import { Collapsible, Divider, Section } from '@tmlmobilidade/ui';

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

			{/* Parameter Conditions */}
			{!isDefaultRule && (
				<Collapsible
					description="Estes parâmetros aplicam-se quando TODAS as condições abaixo se verificam"
					title="1. Quando se aplica esta configuração?"
					defaultOpen
				>
					<ParameterCreateYearPeriods />
					<Divider />
					<ParameterCreateWeekdays />
					<Divider />
					<ParameterCreateDayPeriod />
				</Collapsible>
			)}

			{/* Parameter Type */}
			<Collapsible
				title={`${isDefaultRule ? '1' : '2'}. Que tempos devem ser aplicados?`}
				defaultOpen
			>
				<Section gap="md">
					<ParameterCreateModifiers />
					<ParameterCreateStopsList />
				</Section>
			</Collapsible>

			{/* Vehicle Type */}
			<Collapsible
				title={`${isDefaultRule ? '2' : '3'}. Que tipo de veículo deve realizar esta viagem?`}
				defaultOpen
			>
				<ParameterCreateVehicleType />
			</Collapsible>

		</Section>
	);

	//
}
