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

	const preparedSteps = alertCreateContext.form.multi_step.progress.steps.map((step): StepperDataItem => ({
		id: step.id,
		isEnabled: step.isEnabled ? step.isEnabled() : true,
		label: step.label,
	}));

	//
	// C. Render components

	return (
		<Toolbar>
			<Stepper
				active={alertCreateContext.form.multi_step.progress.current?.index}
				data={preparedSteps}
				onStepClick={alertCreateContext.form.multi_step.actions.goToIndex}
			/>
		</Toolbar>
	);

	//
}
