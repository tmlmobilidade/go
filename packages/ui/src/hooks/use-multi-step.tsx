'use client';

/* * */

import { useCallback, useEffect, useMemo, useState } from 'react';

/* * */

interface MultiStepItem {

	/**
	 * The unique identifier for the step.
	 */
	id: string

	/**
	 * THe index position of the step.
	 */
	index?: number

	/**
	 * Indicates whether the step is enabled.
	 * Usually determined by the completion
	 * of previous steps.
	 */
	isEnabled?: () => boolean

	/**
	 * Indicates whether the step is valid.
	 * Usually determined by the correctness
	 * of the current step's data.
	 */
	isValid?: () => boolean

	/**
	 * Indicates whether the step is visible.
	 * Usually determined by user permissions
	 * or other custom conditions.
	 */
	isVisible?: boolean

	/**
	 * An optional label for the step.
	 */
	label?: string

	/**
	 * The order position of the step
	 * in the multi-step process.
	 */
	order: number

}

interface UseMultiStepProps {

	/**
	 * An array defining the steps in the multi-step process.
	 */
	steps: MultiStepItem[]

}

export interface UseMultiStepReturnType {
	actions: {
		goTo: (id: string) => void
		goToIndex: (idx: number) => void
		next: () => void
		prev: () => void
	}
	progress: {
		current: MultiStepItem | undefined
		next: MultiStepItem | undefined
		prev: MultiStepItem | undefined
		steps: MultiStepItem[]
	}
}

/**
 * Hook to manage multi-step processes.
 * @param steps An array defining the steps in the multi-step process.
 * @returns An object containing the current step and functions to navigate between steps.
 */
export function useMultiStep({ steps }: UseMultiStepProps): UseMultiStepReturnType {
	//

	//
	// A. Setup variables

	const [currentStepId, setCurrentStepId] = useState<string | undefined>();

	//
	// B. Transform data

	const availableSteps = useMemo(() => {
		return steps
			// Only include steps that are marked as visible.
			// Default is visible if not specified.
			.filter(step => step.isVisible !== false)
			// Sort steps by their order
			.sort((a, b) => a.order - b.order)
			// Ensure index is sequential based on visible steps
			.map((step, idx) => ({ ...step, index: idx, isValid: step.isValid || (() => true) }));
	}, [steps]);

	const currentStep = useMemo(() => {
		// Skip if no current step ID is set
		if (!currentStepId) return;
		// Find and return the current step object
		return availableSteps.find(step => step.id === currentStepId);
	}, [availableSteps, currentStepId]);

	const nextStep = useMemo(() => {
		// Exit if no current step
		if (!currentStep) return;
		// Get the index position of the current step
		const currentIndex = availableSteps.findIndex(step => step.id === currentStep.id);
		// If already at the last step, do nothing
		if (currentIndex >= availableSteps.length - 1) return;
		// Get the next step object and set it as current
		const nextStep = availableSteps[currentIndex + 1];
		// Exit if next step is not found
		if (!nextStep) return;
		// Set the next step object
		return nextStep;
	}, [availableSteps, currentStep]);

	const prevStep = useMemo(() => {
		// Exit if no current step
		if (!currentStep) return;
		// Get the index position of the current step
		const currentIndex = availableSteps.findIndex(step => step.id === currentStep.id);
		// If already at the first step, do nothing
		if (currentIndex <= 0) return;
		// Get the prev step object and set it as current
		const prevStep = availableSteps[currentIndex - 1];
		// Exit if prev step is not found
		if (!prevStep) return;
		// Set the prev step object
		return prevStep;
	}, [availableSteps, currentStep]);

	useEffect(() => {
		// Skip if no available steps
		if (!availableSteps.length) return;
		// If no current step is set,
		// default to the first available step
		if (!currentStepId) setCurrentStepId(availableSteps[0].id);
	}, [availableSteps, currentStepId]);

	//
	// C. Handle actions

	const next = useCallback(() => {
		// Exit if no current step
		if (!currentStep) return;
		// Exit if current step is not valid
		if (currentStep.isValid?.() === false) return;
		// Exit if no next step
		if (!nextStep) return;
		// Exit if next step is not enabled
		if (nextStep.isEnabled?.() === false) return;
		// Proceed to the next step
		setCurrentStepId(nextStep.id);
	}, [currentStep, nextStep]);

	const prev = useCallback(() => {
		// Exit if no current step
		if (!currentStep) return;
		// Exit if no previous step
		if (!prevStep) return;
		// Exit if previous step is not enabled
		if (prevStep.isEnabled?.() === false) return;
		// Proceed to the previous step
		setCurrentStepId(prevStep.id);
	}, [currentStep, prevStep]);

	const goTo = useCallback((id: string) => {
		// Get the desired step object
		const destStep = availableSteps.find(step => step.id === id);
		// Exit if the step is not found
		if (!destStep) return;
		// Exit if the desired step is not enabled
		if (destStep.isEnabled?.() === false) return;
		// Proceed to set the current step
		setCurrentStepId(id);
	}, [availableSteps]);

	const goToIndex = useCallback((idx: number) => {
		// Exit if the index is out of bounds
		if (idx < 0 || idx >= availableSteps.length) return;
		// Navigate to the step at the specified index
		goTo(availableSteps[idx].id);
	}, [availableSteps, goTo]);

	//
	// C. Return values

	return {
		actions: {
			goTo,
			goToIndex,
			next,
			prev,
		},
		progress: {
			current: currentStep,
			next: nextStep,
			prev: prevStep,
			steps: availableSteps,
		},
	};

	//
}
