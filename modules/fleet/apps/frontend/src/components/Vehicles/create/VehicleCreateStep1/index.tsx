'use client';

import { AgencySelect } from '@/components/common/AgencySelect';
import { DatesSelector } from '@/components/common/DatesSelector';
/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { vehicleSchema } from '@tmlmobilidade/types';
import { Label, Section, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function VehicleCreateStep1() {
	//

	//
	// A. Setup variables

	const vehicleCreateContext = useVehicleCreateContext();

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				label="Dono do veículo"
				placeholder="..."
				required={!vehicleSchema.shape.owner.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('owner')}
			/>

			<AgencySelect
				label="Operador do veículo"
				onChange={vehicleCreateContext.data.form.getInputProps('agency_id').onChange}
				selected={vehicleCreateContext.data.form.values.agency_id}
			/>
			<Spacer size="md" />
			<Label>Data da primeira operação</Label>
			<DatesSelector />
		</Section>
	);

	//
}
