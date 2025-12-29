/* * */

import { closeCreateVehicleModal } from '@/components/Vehicles/create/VehicleCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateVehicleDto, CreateVehicleSchema, type Vehicle } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface VehicleCreateContextState {
	actions: {
		createVehicle: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateVehicleDto>
	}
	flags: {
		error: Error | null
		isSaving: boolean
	}
	modal: {
		current_step: number
		current_step_valid: boolean
		nextStep: () => void
		previousStep: () => void
	}
}

/* * */

const VehicleCreateContext = createContext<undefined | VehicleCreateContextState>(undefined);

export function useVehicleCreateContext() {
	const context = useContext(VehicleCreateContext);
	if (!context) {
		throw new Error('useVehicleCreateContext must be used within a VehicleCreateContextProvider');
	}
	return context;
}

/* * */

export const VehicleCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isError, setIsError] = useState<Error | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const [modalCurrentStepState, setModalCurrentStepState] = useState<number>(1);
	const [modalCurrentStepValidState, setModalCurrentStepValidState] = useState<boolean>(false);

	//
	// B. Fetch data

	const { mutate: allVehiclesMutate } = useSWR<Vehicle[]>(API_ROUTES.fleet.VEHICLES_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateVehicleDto>(CreateVehicleSchema);

	//
	// D. Handle actions

	const handleCreateVehicle = async () => {
		setIsError(null);
		setIsSaving(true);
		const response = await fetchData<Vehicle>(API_ROUTES.fleet.VEHICLES_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao criar veículo' });
				setIsError(new Error(response.error));
				setIsSaving(false);
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao criar veículo' });
			}
			setIsSaving(false);
			return;
		}
		form.reset();
		allVehiclesMutate();
		setIsSaving(false);
		closeCreateVehicleModal();
		useToast.success({ message: 'Veículo criado com sucesso', title: 'Sucesso' });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.fleet.VEHICLES_DETAIL(response.data._id)));
	};

	const previousStep = () => {
		setModalCurrentStepState((prev) => {
			if (prev > 1) return prev - 1;
			return 1;
		});
	};

	const nextStep = () => {
		setModalCurrentStepState((prev) => {
			if (prev < 3) return prev + 1;
			return 3;
		});
	};

	const validateCurrentStep = () => {
		// Get latest form values
		const currentValues = form.getValues();
		// By default, set the current step as invalid
		setModalCurrentStepValidState(false);
		// Validate Step 1
		if (modalCurrentStepState === 1) {
			setModalCurrentStepValidState(true);
		}
		// Validate Step 2
		if (modalCurrentStepState === 2) {
			setModalCurrentStepValidState(true);
		}
		// Validate Step 3
		if (modalCurrentStepState === 3) {
			setModalCurrentStepValidState(true);
		}
	};

	useEffect(validateCurrentStep, [modalCurrentStepState]);

	//
	// E. Define context value

	const contextValue: VehicleCreateContextState = useMemo(() => {
		return {
			actions: {
				createVehicle: handleCreateVehicle,
			},
			data: {
				form,
			},
			flags: {
				error: isError,
				isSaving,
			},
			modal: {
				current_step: modalCurrentStepState,
				current_step_valid: modalCurrentStepValidState,
				nextStep,
				previousStep,
			},
		};
	}, [
		form,
		isError,
		isSaving,
		modalCurrentStepState,
		modalCurrentStepValidState,
	]);

	//
	// F. Render components

	return (
		<VehicleCreateContext.Provider value={contextValue}>
			{children}
		</VehicleCreateContext.Provider>
	);

	//
};
