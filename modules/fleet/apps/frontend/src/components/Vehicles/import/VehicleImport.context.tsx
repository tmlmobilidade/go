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

interface VehicleImportContextState {
	actions: {
		createVehicle: () => Promise<void>
		setImportFile: (file: File | null) => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateVehicleDto>
	}
	flags: {
		error: Error | null
		isloading: boolean
		isSaving: boolean
	}
}

/* * */

export const VehicleImportContext = createContext<undefined | VehicleImportContextState>(undefined);

export function useVehicleImportContext() {
	const context = useContext(VehicleImportContext);
	if (!context) {
		throw new Error('useVehicleImportContext must be used within a VehicleImportContextProvider');
	}
	return context;
}

/* * */

export const VehicleImportContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isError, setIsError] = useState<Error | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isloading, setIsloading] = useState(false);

	//
	// B. Fetch data

	const { mutate: allVehiclesMutate } = useSWR<Vehicle[]>(API_ROUTES.fleet.VEHICLES_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateVehicleDto>(CreateVehicleSchema);

	//
	// D. Handle actions

	//

	const handleImportFileValues = async (file: File | null) => {
		setIsError(null);
		setIsSaving(true);
		setIsloading(true);
		const response = await fetchData<Vehicle>(API_ROUTES.fleet.VEHICLES_LIST, 'POST', form.getValues());
		if (typeof response.error === 'string') {
			useToast.error({ message: response.error, title: 'Erro ao extrair veículo' });
			setIsError(new Error(response.error));
			setIsSaving(false);
			setIsloading(false);
			return;
		}
		setIsSaving(false);
		setIsloading(false);
	};

	const handleCreateVehicle = async () => {
		setIsError(null);
		setIsSaving(true);
		setIsloading(true);
		const response = await fetchData<Vehicle>(API_ROUTES.fleet.VEHICLES_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao criar veículo' });
				setIsError(new Error(response.error));
				setIsSaving(false);
				setIsloading(false);
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao criar veículo' });
			}
			setIsSaving(false);
			setIsloading(false);
			return;
		}
		form.reset();
		allVehiclesMutate();
		setIsSaving(false);
		setIsloading(false);
		closeCreateVehicleModal();
		useToast.success({ message: 'Veículo criado com sucesso', title: 'Sucesso' });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.fleet.VEHICLES_DETAIL(response.data._id)));
	};

	//
	// E. Define context value

	const contextValue: VehicleImportContextState = useMemo(() => {
		return {
			actions: {
				createVehicle: handleCreateVehicle,
				setImportFile: handleImportFileValues,
			},
			data: {
				form,
			},
			flags: {
				error: isError,
				isloading,
				isSaving,
			},
		};
	}, [
		form,
		isError,
		isSaving,
		isloading,

	]);

	//
	// F. Render components

	return (
		<VehicleImportContext.Provider value={contextValue}>
			{children}
		</VehicleImportContext.Provider>
	);

	//
};
