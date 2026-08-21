'use client';

import { Pane } from '@tmlmobilidade/ui';

import { useStopCreateContext } from '../StopCreate.context';
import { StopCreateModalControls } from '../StopCreateModalControls';
import { StopCreateModalHeader } from '../StopCreateModalHeader';
import { StopCreateStepLocation } from '../StopCreateStepLocation';
import { StopCreateStepNames } from '../StopCreateStepNames';
import { StopCreateStepSummary } from '../StopCreateStepSummary';

/* * */

export function StopCreate() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	return (
		<Pane footer={[<StopCreateModalControls key="controls" />]} header={[<StopCreateModalHeader key="header" />]}>
			{stopCreateContext.form.multi_step.progress.current?.id === 'location' && <StopCreateStepLocation />}
			{stopCreateContext.form.multi_step.progress.current?.id === 'names' && <StopCreateStepNames />}
			{stopCreateContext.form.multi_step.progress.current?.id === 'summary' && <StopCreateStepSummary />}
		</Pane>
	);
}
