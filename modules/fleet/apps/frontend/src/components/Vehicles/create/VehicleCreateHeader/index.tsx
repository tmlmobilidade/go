'use client';

/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { closeCreateVehicleModal } from '@/components/Vehicles/create/VehicleCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function VehicleCreateHeader() {
	//

	//
	// A. Setup variables

	const vehicleCreateContext = useVehicleCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateVehicleModal} type="close" />
			<Tag label="Novo Veículo" variant="muted" />
			<Label size="lg" singleLine>{vehicleCreateContext.data.form.values.agency_id}</Label>
			<Spacer />
			<Button
				disabled={!vehicleCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={vehicleCreateContext.flags.isSaving}
				onClick={vehicleCreateContext.actions.createVehicle}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
