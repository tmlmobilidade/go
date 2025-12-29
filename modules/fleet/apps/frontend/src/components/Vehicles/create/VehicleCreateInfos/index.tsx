'use client';

import { AgencySelect } from '@/components/common/AgencySelect';

/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { Translations } from '@/lib/translations';
import { VehicleEmissionSchema, VehiclePropulsionSchema, vehicleSchema, VehicleWheelchairSchema } from '@tmlmobilidade/types';
import { Checkbox, DateInput, NumberInput, Section, Select, Spacer, TextInput } from '@tmlmobilidade/ui';

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
			<NumberInput
				label="ID do veículo"
				maxLength={5}
				placeholder="Introduza o ID do veículo"
				required={!vehicleSchema.shape._id.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('_id')}
			/>
			<TextInput
				label="Dono do veículo"
				placeholder="Introduza o dono do veículo"
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

			<DateInput
				key={vehicleCreateContext.data.form.key('registration_date')}
				label="Data de registro do veículo"
				{...vehicleCreateContext.data.form.getInputProps('registration_date')}
			/>

			<TextInput
				label="Matrícula do veículo"
				placeholder="Introduza a matrícula do veículo"
				required={!vehicleSchema.shape.license_plate.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('license_plate')}
			/>

			<TextInput
				label="Modelo do veículo"
				placeholder="Introduza o modelo do veículo"
				required={!vehicleSchema.shape.model.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('model')}
			/>

			<TextInput
				label="Marca do veículo"
				placeholder="Introduza a marca do veículo"
				required={!vehicleSchema.shape.make.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('make')}
			/>

			<NumberInput
				label="Capacidade de assentos"
				placeholder="Introduza a capacidade de assentos"
				required={!vehicleSchema.shape.capacity_seated.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('capacity_seated')}
			/>

			<NumberInput
				label="Capacidade de pé"
				placeholder="Introduza a capacidade de pé"
				required={!vehicleSchema.shape.capacity_standing.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('capacity_standing')}
			/>

			<Spacer size="sm" />

			<Checkbox
				label="Aceita bicicletas"
				{...vehicleCreateContext.data.form.getInputProps('bikes_allowed', { type: 'checkbox' })}
			/>

			<Checkbox
				label="Aceita pagamento por aproximação"
				{...vehicleCreateContext.data.form.getInputProps('contactless', { type: 'checkbox' })}
			/>

			<Checkbox
				label="Contem contagem de passageiros"
				{...vehicleCreateContext.data.form.getInputProps('passenger_counting', { type: 'checkbox' })}
			/>

			<Spacer size="sm" />

			<Select
				label="Propulsão"
				placeholder="Selecione a propulsão do veículo"
				w="100%"
				data={VehiclePropulsionSchema.options.map(value => ({
					key: vehicleCreateContext.data.form.key(value),
					label: Translations.PROPUNSIONAL[value],
					value: value,
				}))}
			/>

			<Select
				label="Classe de emissão"
				placeholder="Selecione a classe de emissão do veículo"
				w="100%"
				data={VehicleEmissionSchema.options.map(value => ({
					key: vehicleCreateContext.data.form.key(value),
					label: Translations.EMISSION[value],
					value: value,
				}))}
			/>

			<Select
				label="Acessibilidade para cadeirantes"
				placeholder="Selecione a acessibilidade para cadeirantes do veículo"
				w="100%"
				data={VehicleWheelchairSchema.options.map(value => ({
					key: vehicleCreateContext.data.form.key(value),
					label: Translations.WHEELCHAIR[value],
					value: value,
				}))}
			/>

		</Section>
	);
}
