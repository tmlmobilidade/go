'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { StopCreateStep1 } from '@/components/stops/create/StopCreateStep1';
import { StopCreateStep2 } from '@/components/stops/create/StopCreateStep2';
import { StopCreateStep3 } from '@/components/stops/create/StopCreateStep3';
import { ErrorDisplay } from '@tmlmobilidade/ui';

/* * */

export function StopCreateModalSwitch() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	if (stopCreateContext.modal.current_step === 1) {
		return <StopCreateStep1 />;
	}

	if (stopCreateContext.modal.current_step === 2) {
		return <StopCreateStep2 />;
	}

	if (stopCreateContext.modal.current_step === 3) {
		return <StopCreateStep3 />;
	}

	return <ErrorDisplay message={`Invalid modal step: ${stopCreateContext.modal.current_step}`} />;

	//
}
