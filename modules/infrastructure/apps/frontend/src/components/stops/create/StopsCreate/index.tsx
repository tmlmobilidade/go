'use client';

import { Pane } from '@tmlmobilidade/ui';

import { useStopsCreateFormStepsContext } from '../StopsCreateFormSteps.context';
import { StopsCreateModalControls } from '../StopsCreateModalControls';
import { StopsCreateModalHeader } from '../StopsCreateModalHeader';
import { StopsCreateStepLocation } from '../StopsCreateStepLocation';
import { StopsCreateStepNames } from '../StopsCreateStepNames';
import { StopsCreateStepSummary } from '../StopsCreateStepSummary';

/* * */

export function StopsCreate() {
	//

	//
	// A. Setup variables

	const { progress } = useStopsCreateFormStepsContext();

	//
	// B. Render components

	return (
		<Pane
			footer={[<StopsCreateModalControls key="controls" />]}
			header={[<StopsCreateModalHeader key="header" />]}
		>
			{progress.current?.id === 'location' && <StopsCreateStepLocation />}
			{progress.current?.id === 'names' && <StopsCreateStepNames />}
			{progress.current?.id === 'summary' && <StopsCreateStepSummary />}
		</Pane>
	);
}
