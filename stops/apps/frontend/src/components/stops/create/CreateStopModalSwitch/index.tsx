'use client';

/* * */

import { CreateStopStep1 } from '@/components/stops/create/CreateStopStep1';
import { useStopCreateContext } from '@/contexts/StopCreate.context';
import { ErrorDisplay } from '@tmlmobilidade/ui';

/* * */

export function CreateStopModalSwitch() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	if (stopCreateContext.modal.current_step === 1) {
		return <CreateStopStep1 />;
	}

	// if (stopCreateContext.modal.current_step === 2) {
	// 	return <CreateStopStep2 />;
	// }

	return <ErrorDisplay message={`Invalid modal step: ${stopCreateContext.modal.current_step}`} />;

	//
}
