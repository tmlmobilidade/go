'use client';

/* * */

import { VehicleImportContext } from '@/components/Vehicles/import/VehicleImport.context';
import { closeImportVehicleModal } from '@/components/Vehicles/import/VehicleImport.modal';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useContext } from 'react';

/* * */

export function VehicleImportHeader() {
	//

	//
	// A. Setup variables

	const vehicleImportContext = useContext(VehicleImportContext);

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeImportVehicleModal} type="close" />
			<Tag label="Importar Veículo" variant="muted" />
			<Spacer />
			<Button
				disabled={vehicleImportContext?.flags.isSaving || vehicleImportContext?.flags.isloading}
				label="Publicar"
				loading={vehicleImportContext?.flags.isSaving}
				onClick={vehicleImportContext?.actions.createVehicle}
			/>
		</Toolbar>
	);

	//
}
