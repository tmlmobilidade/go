'use client';

import { closeImportVehicleModal } from '@/components/Vehicles/import/VehicleImport.modal';
import { CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function VehicleImportHeader() {
	//
	//
	// A. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeImportVehicleModal} type="close" />
			<Tag label="Importar Veículo" variant="muted" />
			<Spacer />
		</Toolbar>
	);

	//
}
