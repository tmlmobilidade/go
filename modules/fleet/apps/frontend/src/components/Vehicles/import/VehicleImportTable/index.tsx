'use client';

import { AgencySelect } from '@/components/common/AgencySelect';

/* * */

import { useVehicleImportContext } from '@/components/Vehicles/import/VehicleImport.context';
import { Translations } from '@/lib/translations';
import { VehicleEmissionSchema, VehiclePropulsionSchema, vehicleSchema, VehicleWheelchairSchema } from '@tmlmobilidade/types';
import { Checkbox, DateInput, NumberInput, Section, Select, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function VehicleImportTable() {
	//

	//
	// A. Setup variables

	const vehicleImportContext = useVehicleImportContext();

	//
	// B. Render Components

	return (
		<Section gap="md">

			<NumberInput
				key={vehicleImportContext.data.form.key(String('_id'))}
				label="ID do veículo"
				maxLength={5}
				placeholder="Introduza o ID do veículo"
				required={!vehicleSchema.shape._id.isOptional()}
				w="100%"
				onChange={(event) => {
					const value = event.toString(); // only numbers
					vehicleImportContext.data.form.getInputProps('_id').onChange(value);
				}}
			/>

			<TextInput
				key={vehicleImportContext.data.form.key('owner')}
				label="Dono do veículo"
				placeholder="Introduza o dono do veículo"
				required={!vehicleSchema.shape.owner.isOptional()}
				w="100%"
				{...vehicleImportContext.data.form.getInputProps('owner')}
			/>

			<AgencySelect
				key={vehicleImportContext.data.form.key('agency_id')}
				label="Operador do veículo"
				onChange={vehicleImportContext.data.form.getInputProps('agency_id').onChange}
				selected={vehicleImportContext.data.form.values.agency_id}
			/>

			<Spacer size="md" />

			<DateInput
				key={vehicleImportContext.data.form.key('registration_date')}
				label="Data de registro do veículo"
				{...vehicleImportContext.data.form.getInputProps('registration_date')}
			/>

			<TextInput
				key={vehicleImportContext.data.form.key('license_plate')}
				label="Matrícula do veículo"
				maxLength={6}
				placeholder="AA00AA"
				required={!vehicleSchema.shape.license_plate.isOptional()}
				w="100%"
				{...vehicleImportContext.data.form.getInputProps('license_plate')}
				onChange={(event) => {
					const value = event.currentTarget.value.toUpperCase();
					vehicleImportContext.data.form.getInputProps('license_plate').onChange(value);
				}}
			/>

			<TextInput
				key={vehicleImportContext.data.form.key('make')}
				label="Marca do veículo"
				placeholder="Introduza a marca do veículo"
				required={!vehicleSchema.shape.make.isOptional()}
				w="100%"
				{...vehicleImportContext.data.form.getInputProps('make')}
			/>

			<TextInput
				key={vehicleImportContext.data.form.key('model')}
				label="Modelo do veículo"
				placeholder="Introduza o modelo do veículo"
				required={!vehicleSchema.shape.model.isOptional()}
				w="100%"
				{...vehicleImportContext.data.form.getInputProps('model')}
			/>

			<NumberInput
				key={vehicleImportContext.data.form.key('capacity_seated')}
				label="Capacidade de assentos"
				placeholder="Introduza a capacidade de assentos"
				required={!vehicleSchema.shape.capacity_seated.isOptional()}
				w="100%"
				{...vehicleImportContext.data.form.getInputProps('capacity_seated')}
			/>

			<NumberInput
				key={vehicleImportContext.data.form.key('capacity_standing')}
				label="Capacidade de pé"
				placeholder="Introduza a capacidade de pé"
				required={!vehicleSchema.shape.capacity_standing.isOptional()}
				w="100%"
				{...vehicleImportContext.data.form.getInputProps('capacity_standing')}
			/>

			<Spacer size="sm" />

			<Checkbox
				key={vehicleImportContext.data.form.key('bikes_allowed')}
				label="Aceita bicicletas"
				{...vehicleImportContext.data.form.getInputProps('bikes_allowed', { type: 'checkbox' })}
			/>

			<Checkbox
				key={vehicleImportContext.data.form.key('contactless')}
				label="Aceita pagamento por aproximação"
				{...vehicleImportContext.data.form.getInputProps('contactless', { type: 'checkbox' })}
			/>

			<Checkbox
				key={vehicleImportContext.data.form.key('passenger_counting')}
				label="Contem contagem de passageiros"
				{...vehicleImportContext.data.form.getInputProps('passenger_counting', { type: 'checkbox' })}
			/>

			<Spacer size="sm" />

			<Select
				key={vehicleImportContext.data.form.key('propulsion')}
				label="Propulsão"
				placeholder="Selecione a propulsão do veículo"
				w="100%"
				data={VehiclePropulsionSchema.options.map(value => ({
					label: Translations.PROPUNSIONAL[value],
					value: value,
				}))}
				{...vehicleImportContext.data.form.getInputProps('propulsion')}
			/>

			<Select
				key={vehicleImportContext.data.form.key('emission_class')}
				label="Classe de emissão"
				placeholder="Selecione a classe de emissão do veículo"
				w="100%"
				data={VehicleEmissionSchema.options.map(value => ({
					label: Translations.EMISSION[value],
					value: value,
				}))}
				{...vehicleImportContext.data.form.getInputProps('emission_class')}
			/>

			<Select
				key={vehicleImportContext.data.form.key('wheelchair_acessible')}
				label="Acessibilidade para cadeirantes"
				placeholder="Selecione a acessibilidade para cadeirantes do veículo"
				w="100%"
				data={VehicleWheelchairSchema.options.map(value => ({
					label: Translations.WHEELCHAIR[value],
					value: value,
				}))}
				{...vehicleImportContext.data.form.getInputProps('wheelchair_acessible')}
			/>

		</Section>
	);
}
