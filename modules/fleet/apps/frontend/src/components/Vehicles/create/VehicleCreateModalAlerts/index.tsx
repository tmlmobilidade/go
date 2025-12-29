'use client';

/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { AlertMessage } from '@tmlmobilidade/ui';

/* * */

export function VehicleCreateModalAlerts() {
	//

	//
	// A. Setup variables

	const VehicleCreateContext = useVehicleCreateContext();

	//
	// B. Render components

	if (!VehicleCreateContext.flags.error) {
		return null;
	}

	return (
		<AlertMessage
			title={VehicleCreateContext.flags.error?.message ?? 'Erro desconhecido.'}
			variant="danger"
		/>
	);

	//
}
