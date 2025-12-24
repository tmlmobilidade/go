'use client';

/* * */

import { useState } from 'react';

/* * */

interface UseMultiStepProps<TSteps extends readonly string[]> {

	/**
	 * An array of step IDs representing the sequential steps in the process.
	 */
	steps: TSteps

	/**
	 * Function to determine if a step is complete.
	 * @param id The ID of the step to check.
	 * @returns A boolean indicating if the step is complete.
	 */
	validate?: (id: TSteps[number]) => boolean

}

export interface UseMultiStepReturnType<TSteps extends readonly string[]> {
	current: TSteps[number] | undefined
	current_index: number | undefined
	goTo: (id: TSteps[number]) => void
	goToIndex: (idx: number) => void
	isValid: (id: TSteps[number]) => boolean
	next: () => void
	prev: () => void
}

/**
 * Hook to manage multi-step processes.
 * @param steps An array of step IDs representing the sequential steps in the process.
 * @param validate Optional function to determine if a step is complete.
 * @returns An object containing the current step and functions to navigate between steps.
 */
export function useMultiStep<const TSteps extends readonly string[]>({ steps, validate }: UseMultiStepProps<TSteps>): UseMultiStepReturnType<TSteps> {
	//

	//
	// A. Setup variables

	const [currentStepId, setCurrentStepId] = useState<TSteps[number] | undefined>(steps[0]);

	//
	// B. Handle actions

	const isValid = (id: TSteps[number]) => {
		// Get the requested step object
		const foundStep = steps.find(step => step === currentStepId);
		// If no step found, return false
		if (!foundStep) return false;
		// Use the validate function if provided
		if (validate) return validate(id);
		// Default to true if no function provided
		return true;
	};

	const next = () => {
		// Only proceed if the current step is valid
		if (!isValid(currentStepId)) return;
		// Get the index position of the current step
		const currentIndex = steps.findIndex(step => step === currentStepId);
		// If already at the last step, do nothing
		if (currentIndex >= steps.length - 1) return;
		// Get the next step object and set it as current
		const nextStep = steps[currentIndex + 1];
		if (nextStep) setCurrentStepId(nextStep);
	};

	const prev = () => {
		// Get the index position of the current step
		const currentIndex = steps.findIndex(step => step === currentStepId);
		// If already at the first step, do nothing
		if (currentIndex <= 0) return;
		// Get the previous step object and set it as current
		const prevStep = steps[currentIndex - 1];
		if (prevStep) setCurrentStepId(prevStep);
	};

	const goTo = (id: TSteps[number]) => {
		// Only proceed if the desired step is valid
		if (!isValid(id)) return;
		// Check if the step exists
		const stepExists = steps.some(step => step === id);
		// If it exists, set it as the current step
		if (stepExists) setCurrentStepId(id);
	};

	const goToIndex = (idx: number) => {
		// Navigate to the step at the specified index
		goTo(steps[idx]);
	};

	//
	// C. Return values

	return {
		current: steps.find(step => step === currentStepId),
		current_index: steps.findIndex(step => step === currentStepId),
		goTo,
		goToIndex,
		isValid,
		next,
		prev,
	};

	//
}
