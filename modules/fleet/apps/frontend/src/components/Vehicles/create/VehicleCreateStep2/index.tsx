'use client';

/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { vehicleSchema } from '@tmlmobilidade/types';
import { Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function VehicleCreateStep2() {
	//

	//
	// A. Setup variables

	const vehicleCreateContext = useVehicleCreateContext();

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				label="Matrícula do veículo"
				placeholder="..."
				required={!vehicleSchema.shape.license_plate.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('license_plate')}
			/>
			<TextInput
				label="Modelo do veículo"
				placeholder="..."
				required={!vehicleSchema.shape.model.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('model')}
			/>
			<TextInput
				label="Marca do veículo"
				placeholder="..."
				required={!vehicleSchema.shape.make.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('make')}
			/>
		</Section>
	);

	//
}
