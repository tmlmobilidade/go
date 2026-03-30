'use client';

/* * */

import { useVehiclesDetailContext } from '@/contexts/VehiclesDetail.context';
import { Translations } from '@/lib/translations';
import { VehicleEmissionSchema, VehiclePropulsionSchema, VehicleWheelchairSchema } from '@tmlmobilidade/types';
import { Collapsible, ErrorDisplay, Grid, LoadingOverlay, NumberInput, Section, Select, TextInput } from '@tmlmobilidade/ui';

/* * */

export function VehicleDetailsSectionSpecifications() {
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
		<Collapsible description="Especificações do veículo, como marca, modelo, capacidade de assentos, etc..." title="Especificações">
			<Section>
				<Grid columns="ab" gap="md">
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
		</Collapsible>

	);

	//
}
