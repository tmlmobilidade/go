'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { Stepper, type StepperDataItem, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateHeader() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Transform data

	const preparedSteps = alertCreateContext.data.multi_step.progress.steps.map((step): StepperDataItem => ({
		id: step.id,
		isEnabled: step.isEnabled ? step.isEnabled() : true,
		label: step.label,
	}));

	//
	// C. Render components

	return (
		<Toolbar>
			<Stepper
				active={alertCreateContext.data.multi_step.progress.current?.index}
				data={preparedSteps}
				onStepClick={alertCreateContext.data.multi_step.actions.goToIndex}
			/>
		</Toolbar>
	);

	//
}
