'use client';

/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { vehicleSchema } from '@tmlmobilidade/types';
// import { vehicleSchema } from '@tmlmobilidade/types';
import { Section, Textarea, TextInput } from '@tmlmobilidade/ui';

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

			<Textarea
				label="Operador do veículo"
				placeholder="Ex : Empresa X"
				required={!vehicleSchema.shape.agency_id.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('agency')}
			/>
		</Section>
	);

	//
}
