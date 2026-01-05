'use client';

/* * */

import { VehicleImportContext } from '@/components/Vehicles/import/VehicleImport.context';
import { closeImportVehicleModal } from '@/components/Vehicles/import/VehicleImport.modal';
import { CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useContext } from 'react';

/* * */

export function VehicleImportModalHeader() {
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
			<Label size="md" caps singleLine>Passo {vehicleImportContext?.modal.current_step} de 3</Label>
		</Toolbar>
	);

	//
}
