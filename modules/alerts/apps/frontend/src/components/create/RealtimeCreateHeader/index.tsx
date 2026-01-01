'use client';

/* * */

import { createRealtimeSteps, useRealtimeCreateContext } from '@/components/create/RealtimeCreate.context';
import { Stepper, type StepperDataItem, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreateHeader() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	//
	// B. Transform data

	const preparedSteps = createRealtimeSteps.map((step): StepperDataItem => ({
		id: step,
		isEnabled: realtimeCreateContext.data.multi_step.isValid(step),
		isLoading: step === 'references' ? realtimeCreateContext.flags.isRidesLoading : false,
		label: step === 'cause' ? 'Causa' : step === 'effect' ? 'Efeito' : step === 'references' ? 'Referências' : step === 'summary' ? 'Resumo' : '',
	}));

	//
	// B. Render components

	return (
		<Toolbar>
			<Stepper
				active={realtimeCreateContext.data.multi_step.current_index}
				data={preparedSteps}
				onStepClick={realtimeCreateContext.data.multi_step.goToIndex}
			/>
		</Toolbar>
	);

	//
}
