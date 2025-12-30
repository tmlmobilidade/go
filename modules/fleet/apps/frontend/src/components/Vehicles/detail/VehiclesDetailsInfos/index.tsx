'use client';

import { AgencySelect } from '@/components/common/AgencySelect';
/* * */

import { useVehiclesDetailContext } from '@/contexts/VehiclesDetail.context';
import { Translations } from '@/lib/translations';
import { VehicleEmissionSchema, VehiclePropulsionSchema, VehicleWheelchairSchema } from '@tmlmobilidade/types';
// import { vehicleSchema } from '@tmlmobilidade/types';
import { Checkbox, DateInput, ErrorDisplay, Grid, LoadingOverlay, NumberInput, Section, Select, TextInput } from '@tmlmobilidade/ui';

/* * */

export function VehicleDetailsInfos() {
	//

	//
	// A. Setup variables

	const vehiclesDetailContext = useVehiclesDetailContext();

	//
	// B. Render components

	if (vehiclesDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (vehiclesDetailContext.flags.error) {
		return <ErrorDisplay message={vehiclesDetailContext.flags.error.message} />;
	}

	return (
		<Section>
			<Grid columns="a" gap="lg">

				<TextInput
					label="ID do veículo"
					readOnly={true}
					{...vehiclesDetailContext.data.form.getInputProps('_id')}
				/>

				<TextInput
					key={vehiclesDetailContext.data.form.key('owner')}
					label="Dono do veículo"
					readOnly={vehiclesDetailContext.flags.read_only}
					{...vehiclesDetailContext.data.form.getInputProps('owner')}
				/>

				<AgencySelect
					key={vehiclesDetailContext.data.form.key('agency_id')}
					label="Operador do veículo"
					onChange={vehiclesDetailContext.data.form.getInputProps('agency_id').onChange}
					readOnly={vehiclesDetailContext.flags.read_only}
					selected={vehiclesDetailContext.data.form.values.agency_id}
				/>

				<DateInput
					key={vehiclesDetailContext.data.form.key('registration_date')}
					label="Data de registro do veículo"
					readOnly={vehiclesDetailContext.flags.read_only}
					{...vehiclesDetailContext.data.form.getInputProps('registration_date')}
				/>

				<TextInput
					key={vehiclesDetailContext.data.form.key('license_plate')}
					label="Placa do veículo"
					readOnly={vehiclesDetailContext.flags.read_only}
					{...vehiclesDetailContext.data.form.getInputProps('license_plate')}
				/>

				<TextInput
					key={vehiclesDetailContext.data.form.key('make')}
					label="Marca do veículo"
					readOnly={vehiclesDetailContext.flags.read_only}
					{...vehiclesDetailContext.data.form.getInputProps('make')}
				/>

				<TextInput
					key={vehiclesDetailContext.data.form.key('model')}
					label="Modelo do veículo"
					readOnly={vehiclesDetailContext.flags.read_only}
					{...vehiclesDetailContext.data.form.getInputProps('model')}
				/>

				<NumberInput
					key={vehiclesDetailContext.data.form.key('capacity_seated')}
					label="Capacidade de assentos"
					readOnly={vehiclesDetailContext.flags.read_only}
					{...vehiclesDetailContext.data.form.getInputProps('capacity_seated')}
				/>

				<NumberInput
					key={vehiclesDetailContext.data.form.key('capacity_standing')}
					label="Capacidade de pé"
					readOnly={vehiclesDetailContext.flags.read_only}
					{...vehiclesDetailContext.data.form.getInputProps('capacity_standing')}
				/>

				<Checkbox
					key={vehiclesDetailContext.data.form.key('bikes_allowed')}
					disabled={vehiclesDetailContext.flags.read_only}
					label="Aceita bicicletas"
					{...vehiclesDetailContext.data.form.getInputProps('bikes_allowed', { type: 'checkbox' })}
				/>

				<Checkbox
					key={vehiclesDetailContext.data.form.key('contactless')}
					disabled={vehiclesDetailContext.flags.read_only}
					label="Aceita pagamento por aproximação"
					{...vehiclesDetailContext.data.form.getInputProps('contactless', { type: 'checkbox' })}
				/>

				<Checkbox
					key={vehiclesDetailContext.data.form.key('passenger_counting')}
					disabled={vehiclesDetailContext.flags.read_only}
					label="Contagem de passageiros ativa"
					{...vehiclesDetailContext.data.form.getInputProps('passenger_counting', { type: 'checkbox' })}
				/>

				<Select
					key={vehiclesDetailContext.data.form.key('propulsion')}
					data={VehiclePropulsionSchema.options.map(value => ({ label: Translations.PROPUNSIONAL[value], value }))}
					disabled={vehiclesDetailContext.flags.read_only}
					label="Propulsão"
					{...vehiclesDetailContext.data.form.getInputProps('propulsion')}
				/>

				<Select
					key={vehiclesDetailContext.data.form.key('emission_class')}
					data={VehicleEmissionSchema.options.map(value => ({ label: Translations.EMISSION[value], value }))}
					disabled={vehiclesDetailContext.flags.read_only}
					label="Classe de emissão"
					{...vehiclesDetailContext.data.form.getInputProps('emission_class')}
				/>

				<Select
					key={vehiclesDetailContext.data.form.key('wheelchair_acessible')}
					data={VehicleWheelchairSchema.options.map(value => ({ label: Translations.WHEELCHAIR[value], value }))}
					disabled={vehiclesDetailContext.flags.read_only}
					label="Acessibilidade para cadeirantes"
					{...vehiclesDetailContext.data.form.getInputProps('wheelchair_acessible')}
				/>

			</Grid>
		</Section>
	);

	//
}
