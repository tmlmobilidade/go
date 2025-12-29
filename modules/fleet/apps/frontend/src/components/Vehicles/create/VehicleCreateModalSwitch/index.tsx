'use client';

/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { VehicleCreateStep1 } from '@/components/Vehicles/create/VehicleCreateStep1';
import { VehicleCreateStep2 } from '@/components/Vehicles/create/VehicleCreateStep2';
import { VehicleCreateStep3 } from '@/components/Vehicles/create/VehicleCreateStep3';
import { ErrorDisplay } from '@tmlmobilidade/ui';

/* * */

export function VehicleCreateModalSwitch() {
	//

	//
	// A. Setup variables

	const vehicleCreateContext = useVehicleCreateContext();

	//
	// B. Render components

	if (vehicleCreateContext.modal.current_step === 1) {
		return <VehicleCreateStep1 />;
	}

	if (vehicleCreateContext.modal.current_step === 2) {
		return <VehicleCreateStep2 />;
	}

	if (vehicleCreateContext.modal.current_step === 3) {
		return <VehicleCreateStep3 />;
	}

	return <ErrorDisplay message={`Invalid modal step: ${vehicleCreateContext.modal.current_step}`} />;
	//
}
