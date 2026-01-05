'use client';

/* * */

import { AlertMessage } from '@tmlmobilidade/ui';

import { useVehicleImportContext } from '../VehicleImport.context';

/* * */

export function VehicleImportModalAlerts() {
	//

	//
	// A. Setup variables

	const vehicleImportContext = useVehicleImportContext();

	//
	// B. Render components

	if (!vehicleImportContext.flags.error) {
		return null;
	}

	return (
		<AlertMessage
			title={vehicleImportContext.flags.error?.message ?? 'Erro desconhecido.'}
			variant="danger"
		/>
	);

	//
}
