'use client';

/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { Button, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function VehicleCreateModalControls() {
	//

	//
	// A. Setup variables

	const vehicleCreateContext = useVehicleCreateContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="ab" gap="md">
				<Button
					disabled={vehicleCreateContext.flags.isSaving || vehicleCreateContext.modal.current_step === 1}
					label="Voltar"
					loading={vehicleCreateContext.flags.isSaving}
					onClick={vehicleCreateContext.modal.previousStep}
				/>
				<Button
					disabled={!vehicleCreateContext.modal.current_step_valid}
					label={vehicleCreateContext.modal.current_step === 3 ? 'Criar Veículo' : 'Próximo Passo'}
					loading={vehicleCreateContext.flags.isSaving}
					onClick={vehicleCreateContext.modal.current_step === 3 ? vehicleCreateContext.actions.createVehicle : vehicleCreateContext.modal.nextStep}
				/>
			</Grid>
		</Section>
	);

	//
}
