'use client';

/* * */

import { useVehiclesDetailContext } from '@/contexts/VehiclesDetail.context';
import { Checkbox, Collapsible, ErrorDisplay, Grid, LoadingOverlay, Section } from '@tmlmobilidade/ui';

/* * */

export function VehicleDetailsSectionFunctionalities() {
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
		<Collapsible description="Funcionalidades do veículo, como aceitação de bicicletas, pagamento com contactless, contagem de passageiros, etc..." title="Funcionalidades">
			<Section>
				<Grid columns="a" gap="sm">
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
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
