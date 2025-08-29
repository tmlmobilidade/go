'use client';

/* * */

import { Step, useMultiStepForm } from '@/hooks/use-multistep-form';

import { RealtimeStepCause } from '../RealtimeStepCause';
import { RealtimeStepTripDetails } from '../RealtimeStepTripDetails';

/* * */

const STEPS: Step[] = [
	{
		component: RealtimeStepCause,
		id: 'cause',
	},
	{
		component: RealtimeStepTripDetails,
		id: 'trip-details',
	},
];

export function useRealtimeSteps() {
	//
	// A. Setup variables
	const multiStepForm = useMultiStepForm({ steps: STEPS });
	return {
		...multiStepForm,
	};
}
