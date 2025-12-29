'use client';

import { AgencySelect } from '@/components/common/AgencySelect';

/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { vehicleSchema } from '@tmlmobilidade/types';
import { DateInput, Label, Section, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function VehicleCreateInfos() {
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

			<Label>Data de registro do veículo</Label>
			<DateInput
				key={vehicleCreateContext.data.form.key('registration_date')}
				{...vehicleCreateContext.data.form.getInputProps('registration_date')}
			/>

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
