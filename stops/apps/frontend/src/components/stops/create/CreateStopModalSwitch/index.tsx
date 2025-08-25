'use client';

/* * */

import { useStopCreateContext } from '@/contexts/StopCreate.context';
import { ErrorDisplay } from '@tmlmobilidade/ui';

import CreateStopStep1 from '../CreateStopStep1';

/* * */

export function CreateStopModalSwitch() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render Components

	if (stopCreateContext.modal.current_step === 1) {
		return <CreateStopStep1 />;
	}

	// if (stopCreateContext.modal.current_step === 2) {
	// 	return <CreateStopStep2 />;
	// }

	return <ErrorDisplay message={`Invalid modal step: ${stopCreateContext.modal.current_step}`} />;

	//
}
