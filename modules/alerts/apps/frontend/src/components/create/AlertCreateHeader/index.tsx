'use client';

/* * */

import { createRealtimeSteps, useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { Stepper, type StepperDataItem, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateHeader() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Transform data

	const preparedSteps = createRealtimeSteps.map((step): StepperDataItem => ({
		id: step,
		isEnabled: alertCreateContext.data.multi_step.isValid(step),
		label: step === 'cause' ? 'Causa' : step === 'effect' ? 'Efeito' : step === 'dates' ? 'Datas' : step === 'references' ? 'Referências' : step === 'summary' ? 'Resumo' : '',
	}));

	//
	// C. Render components

	return (
		<Toolbar>
			<Stepper
				active={alertCreateContext.data.multi_step.current_index}
				data={preparedSteps}
				onStepClick={alertCreateContext.data.multi_step.goToIndex}
			/>
		</Toolbar>
	);

	//
}
