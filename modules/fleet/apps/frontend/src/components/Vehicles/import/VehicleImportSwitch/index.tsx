'use client';

/* * */

import { ErrorDisplay } from '@tmlmobilidade/ui';

import { useVehicleImportContext } from '../VehicleImport.context';
import { VehicleImportStep1 } from '../VehicleImportStep1';
import { VehicleImportStep2 } from '../VehicleImportStep2';

/* * */

export function VehicleImportModalSwitch() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useVehicleImportContext();

	//
	// B. Render components

	if (stopCreateContext.modal.current_step === 1) {
		return <VehicleImportStep1 />;
	}

	if (stopCreateContext.modal.current_step === 2) {
		return <VehicleImportStep2 />;
	}

	if (stopCreateContext.modal.current_step === 3) {
		return;
	}

	return <ErrorDisplay message={`Invalid modal step: ${stopCreateContext.modal.current_step}`} />;

	//
}
