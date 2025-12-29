'use client';

/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { closeCreateVehicleModal } from '@/components/Vehicles/create/VehicleCreate.modal';
import { CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function VehicleCreateModalHeader() {
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
			<Label size="md" caps singleLine>Passo {vehicleCreateContext.modal.current_step} de 3</Label>
		</Toolbar>
	);

	//
}
