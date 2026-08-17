'use client';

import { Stepper, type StepperDataItem, Toolbar } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useAlertsCreateFormStepsContext } from '../AlertsCreateFormSteps.context';

/* * */

export function AlertCreateHeader() {
	//

	//
	// A. Setup variables

	const { actions: alertsCreateFormStepsActions, progress: alertsCreateFormStepsProgress } = useAlertsCreateFormStepsContext();

	const preparedSteps = useMemo(() => {
		return alertsCreateFormStepsProgress.steps.map((step): StepperDataItem => {
			console.log('step', step.id, step.isEnabled?.());
			return {
				id: step.id,
				isEnabled: step.isEnabled ? step.isEnabled() : true,
				label: step.label,
			};
		});
	}, [alertsCreateFormStepsProgress.steps]);

	console.log('preparedSteps', preparedSteps);

	//
	// C. Render components

	return (
		<Toolbar>
			<Stepper
				active={alertsCreateFormStepsProgress.current?.index}
				data={preparedSteps}
				onStepClick={alertsCreateFormStepsActions.goToIndex}
			/>
		</Toolbar>
	);
}
