import { useCallback, useMemo, useState } from 'react';

export interface Step {
	component: React.ComponentType
	id: string
	isVisible?: () => boolean // Optional visibility condition
}

interface UseMultiStepFormProps {
	initialStep?: number
	steps: Step[]
}

export interface UseMultiStepFormState {
	actions: {
		goToStep: (index: number) => void
		nextStep: () => void
		prevStep: () => void
	}
	data: {
		currentStep: Step
	}
	flags: {
		currentIndex: number
		isFirst: boolean
		isLast: boolean
	}
}

export function useMultiStepForm({ initialStep = 0, steps }: UseMultiStepFormProps): UseMultiStepFormState {
	//
	// A. Setup variables
	const visibleSteps = useMemo(() => steps.filter(step => (step.isVisible ? step.isVisible() : true)), [steps]);
	const [currentIndex, setCurrentIndex] = useState(initialStep);

	//
	// B. Setup functions
	const nextStep = useCallback(() => {
		setCurrentIndex(prev => (prev < visibleSteps.length - 1 ? prev + 1 : prev));
	}, [visibleSteps.length]);

	const prevStep = useCallback(() => {
		setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
	}, []);

	const goToStep = useCallback((index: number) => {
		if (index >= 0 && index < visibleSteps.length) {
			setCurrentIndex(index);
		}
	}, [visibleSteps.length]);

	//
	// C. Define State
	const state: UseMultiStepFormState = useMemo(() => ({
		actions: {
			goToStep,
			nextStep,
			prevStep,
		},
		data: {
			currentStep: visibleSteps[currentIndex],
		},
		flags: {
			currentIndex,
			isFirst: currentIndex === 0,
			isLast: currentIndex === visibleSteps.length - 1,
		},
	}), [visibleSteps, currentIndex]);

	//
	// D. Return state
	return state;
}
