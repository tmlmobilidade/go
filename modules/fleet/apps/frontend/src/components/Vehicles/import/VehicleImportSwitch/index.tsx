'use client';

/* * */

import { ErrorDisplay } from '@tmlmobilidade/ui';

import { useVehicleImportContext } from '../VehicleImport.context';

/* * */

export function VehicleImportModalSwitch() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useVehicleImportContext();

	//
	// B. Render components

	if (stopCreateContext.modal.current_step === 1) {
		return;
	}

	if (stopCreateContext.modal.current_step === 2) {
		return;
	}

	if (stopCreateContext.modal.current_step === 3) {
		return;
	}

	return <ErrorDisplay message={`Invalid modal step: ${stopCreateContext.modal.current_step}`} />;

	//
}
