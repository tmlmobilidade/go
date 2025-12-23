'use client';

/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { vehicleSchema } from '@tmlmobilidade/types';
import { Section, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function VehicleCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const vehicleCreateContext = useVehicleCreateContext();

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				label="Título"
				placeholder="Ex: Greve de transportes"
				// required={!vehicleSchema.shape..isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('title')}
			/>

			<Textarea
				label="Descrição"
				minRows={2}
				placeholder="Descreva o evento ou observação..."
				// required={!vehicleSchema.shape.description.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('description')}
			/>
		</Section>
	);

	//
}
