import { Validation } from '@tmlmobilidade/types';
import { useMemo, useState } from 'react';

interface CreatePlanState {
	actions: {
		createPlan: () => void
		setSelectedValidation: (validation_id: string) => void
	}
	data: {
		selectedValidation: null | Validation
		validations: Validation[]
	}
	flags: {
		canCreatePlan: boolean
		loading: boolean
	}
}

export function useCreatePlan(validations: Validation[]) {
	//

	//
	// A. Define state
	const [selectedValidation, setSelectedValidation] = useState<null | Validation>(null);

	//
	// B. Define actions
	const handleCreatePlan = () => {
		// TODO: Implement plan creation logic
		console.log('createPlan', selectedValidation);
	};

	const handleSetSelectedValidation = (validation_id: string) => {
		setSelectedValidation(validations.find(v => v._id === validation_id) ?? null);
	};

	//
	// D. Define context value
	const contextValue: CreatePlanState = useMemo(() => {
		return {
			actions: {
				createPlan: handleCreatePlan,
				setSelectedValidation: handleSetSelectedValidation,
			},
			data: {
				selectedValidation,
				validations: validations.filter(v => v.feeder_status === 'success'),
			},
			flags: {
				canCreatePlan: selectedValidation !== null,
				loading: false,
			},
		};
	}, [selectedValidation]);

	return contextValue;
}
