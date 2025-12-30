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
			<TextInput
				key={vehicleCreateContext.data.form.key('_id')}
				label="ID do veículo"
				maxLength={5}
				placeholder="Introduza o ID do veículo"
				required={!vehicleSchema.shape._id.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('_id')}
			/>
			<TextInput
				key={vehicleCreateContext.data.form.key('owner')}
				label="Dono do veículo"
				placeholder="Introduza o dono do veículo"
				required={!vehicleSchema.shape.owner.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('owner')}
			/>

			<AgencySelect
				key={vehicleCreateContext.data.form.key('agency_id')}
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
				// key={vehicleCreateContext.data.form.key('license_plate')}
				label="Matrícula do veículo"
				maxLength={8}
				placeholder="AA-00-AA"
				required={!vehicleSchema.shape.license_plate.isOptional()}
				w="100%"
				onChange={(event) => {
					// Remove formatting and invalid chars
					const clean = event.currentTarget.value
						.toUpperCase()
						.replace(/[^A-Z0-9]/g, '')
						.slice(0, 6); // 🔒 only 6 chars saved

					vehicleCreateContext.data.form.setFieldValue('license_plate', clean);
				}}
				value={(() => {
					const raw = vehicleCreateContext.data.form.values.license_plate ?? '';

					if (raw.length <= 2) return raw;
					if (raw.length <= 4) return `${raw.slice(0, 2)}-${raw.slice(2)}`;

					return `${raw.slice(0, 2)}-${raw.slice(2, 4)}-${raw.slice(4, 6)}`;
				})()}
			/>

			<TextInput
				key={vehicleCreateContext.data.form.key('make')}
				label="Marca do veículo"
				placeholder="Introduza a marca do veículo"
				required={!vehicleSchema.shape.make.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('make')}
			/>

			<TextInput
				key={vehicleCreateContext.data.form.key('model')}
				label="Modelo do veículo"
				placeholder="Introduza o modelo do veículo"
				required={!vehicleSchema.shape.model.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('model')}
			/>

			<NumberInput
				key={vehicleCreateContext.data.form.key('capacity_seated')}
				label="Capacidade de assentos"
				placeholder="Introduza a capacidade de assentos"
				required={!vehicleSchema.shape.capacity_seated.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('capacity_seated')}
			/>

			<NumberInput
				key={vehicleCreateContext.data.form.key('capacity_standing')}
				label="Capacidade de pé"
				placeholder="Introduza a capacidade de pé"
				required={!vehicleSchema.shape.capacity_standing.isOptional()}
				w="100%"
				{...vehicleCreateContext.data.form.getInputProps('capacity_standing')}
			/>

			<Spacer size="sm" />

			<Checkbox
				key={vehicleCreateContext.data.form.key('bikes_allowed')}
				label="Aceita bicicletas"
				{...vehicleCreateContext.data.form.getInputProps('bikes_allowed', { type: 'checkbox' })}
			/>

			<Checkbox
				key={vehicleCreateContext.data.form.key('contactless')}
				label="Aceita pagamento por aproximação"
				{...vehicleCreateContext.data.form.getInputProps('contactless', { type: 'checkbox' })}
			/>

			<Checkbox
				key={vehicleCreateContext.data.form.key('passenger_counting')}
				label="Contem contagem de passageiros"
				{...vehicleCreateContext.data.form.getInputProps('passenger_counting', { type: 'checkbox' })}
			/>

			<Spacer size="sm" />

			<Select
				key={vehicleCreateContext.data.form.key('propulsion')}
				label="Propulsão"
				placeholder="Selecione a propulsão do veículo"
				w="100%"
				data={VehiclePropulsionSchema.options.map(value => ({
					label: Translations.PROPUNSIONAL[value],
					value: value,
				}))}
				{...vehicleCreateContext.data.form.getInputProps('propulsion')}
			/>

			<Select
				key={vehicleCreateContext.data.form.key('emission_class')}
				label="Classe de emissão"
				placeholder="Selecione a classe de emissão do veículo"
				w="100%"
				data={VehicleEmissionSchema.options.map(value => ({
					label: Translations.EMISSION[value],
					value: value,
				}))}
				{...vehicleCreateContext.data.form.getInputProps('emission_class')}
			/>

			<Select
				key={vehicleCreateContext.data.form.key('wheelchair_acessible')}
				label="Acessibilidade para cadeirantes"
				placeholder="Selecione a acessibilidade para cadeirantes do veículo"
				w="100%"
				data={VehicleWheelchairSchema.options.map(value => ({
					label: Translations.WHEELCHAIR[value],
					value: value,
				}))}
				{...vehicleCreateContext.data.form.getInputProps('wheelchair_acessible')}
			/>

		</Section>
	);
}
