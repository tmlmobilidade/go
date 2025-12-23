/* * */

import { closeCreateVehicleModal } from '@/components/Vehicles/create/VehicleCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateVehicleDto, CreateVehicleSchema, type Vehicle } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
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
		isSaving: boolean
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

	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Fetch data

	const { mutate: allVehiclesMutate } = useSWR<Vehicle[]>(API_ROUTES.dates.ANNOTATIONS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateVehicleDto>(CreateVehicleSchema);

	//
	// D. Handle actions

	const handleCreateVehicle = async () => {
		setIsSaving(true);
		const response = await fetchData<Vehicle>(API_ROUTES.dates.ANNOTATIONS_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao criar veículo' });
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
		useToast.success({ message: 'Anotação criada com sucesso', title: 'Sucesso' });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(response.data._id)));
	};

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
				isSaving,
			},
		};
	}, [
		form,
		isSaving,
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
