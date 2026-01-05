'use client';

/* * */

import { VehicleImportContext } from '@/components/Vehicles/import/VehicleImport.context';
import { closeImportVehicleModal } from '@/components/Vehicles/import/VehicleImport.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useContext } from 'react';

/* * */

export function VehicleImportModalHeader() {
	//

	//
	// A. Setup variables

	const vehicleImportContext = useContext(VehicleImportContext);
	const hasImportContext = !!vehicleImportContext;

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeImportVehicleModal} type="close" />
			<Tag label="Importar Veículo" variant="muted" />
			<Spacer />
			<Button
				disabled={!hasImportContext || !vehicleImportContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={hasImportContext ? vehicleImportContext.flags.isSaving : false}
				onClick={hasImportContext ? vehicleImportContext.actions.createVehicle : undefined}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
