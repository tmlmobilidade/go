'use client';

/* * */

import { Button, Grid, Section } from '@tmlmobilidade/ui';

import { useVehicleImportContext } from '../VehicleImport.context';

/* * */

export function VehicleImportModalControls() {
	//

	//
	// A. Setup variables

	const vehicleImportContext = useVehicleImportContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="ab" gap="md">
				<Button
					disabled={vehicleImportContext.flags.isSaving || vehicleImportContext.modal.current_step === 1}
					label="Voltar"
					loading={vehicleImportContext.flags.isSaving}
					onClick={vehicleImportContext.modal.previousStep}
				/>
				<Button
					disabled={!vehicleImportContext.modal.current_step_valid}
					label={vehicleImportContext.modal.current_step === 3 ? 'Criar Veículo' : 'Próximo Passo'}
					loading={vehicleImportContext.flags.isSaving}
					onClick={vehicleImportContext.modal.current_step === 3 ? vehicleImportContext.actions.createVehicle : vehicleImportContext.modal.nextStep}
				/>
			</Grid>
		</Section>
	);

	//
}
