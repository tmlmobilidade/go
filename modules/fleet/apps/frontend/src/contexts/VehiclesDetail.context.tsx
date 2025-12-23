'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type UpdateVehicleDto, type Vehicle } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface VehiclesDetailContextState {
	actions: {
		deleteVehicle: () => void
		saveVehicle: () => void
		toggleLock: () => void
	}
	data: {
		form: UseFormReturnType<UpdateVehicleDto>
		id: string
		vehicle: null | Vehicle
	}
	flags: {
		error: Error | null
		loading: boolean
		read_only: boolean
		saving: boolean
	}
}

/* * */

const VehiclesDetailContext = createContext<undefined | VehiclesDetailContextState>(undefined);

export function useVehiclesDetailContext() {
	const context = useContext(VehiclesDetailContext);
	if (!context) {
		throw new Error('useVehiclesDetailContext must be used within a VehiclesDetailContextProvider');
	}
	return context;
}

/* * */

export const VehiclesDetailContextProvider = ({ children, vehicleId }: PropsWithChildren<{ vehicleId: string }>) => {
	//

	//
	// A. Setup variables

	const [isSaving, setIsSaving] = useState(false);
	const router = useRouter();

	//
	// B. Fetch data

	const { mutate: vehiclesListMutate } = useSWR<Vehicle[]>(API_ROUTES.fleet.ANNOTATIONS_LIST);
	const { data: vehicleData, error: vehicleError, isLoading: vehicleLoading, mutate: vehicleMutate } = useSWR<Vehicle>(API_ROUTES.fleet.ANNOTATIONS_DETAIL(vehicleId), { refreshInterval: 5000 });

	//
	// C. Setup form

	const form = useForm<UpdateVehicleDto>({
		initialValues: {
			agency_id: '',
			dates: [],
			description: '',
			title: '',
			updated_by: '',
		},
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// D. Transform data

	useEffect(() => {
		if (!vehicleData) return;
		form.initialize({
			agency_id: vehicleData.agency_id,
			registration_date: vehicleData.registration_date,
			updated_by: vehicleData.updated_by,
		});
	}, [vehicleData]);

	useEffect(() => {
		if (!vehicleError) return;
		useToast.error({ message: vehicleError.message, title: 'Erro ao abrir ocorrência' });
	}, [vehicleLoading]);

	//
	// E. Handle actions

	const handleSaveVehicle = async () => {
		setIsSaving(true);
		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A guardar ocorrência',
		});
		try {
			const response = await fetchData<Vehicle>(API_ROUTES.dates.VEHICLE_DETAIL(vehicleId), 'PUT', form.getValues());
			if (response.error) {
				return useToast.update(toastId, {
					loading: false,
					message: response.error,
					title: 'Erro ao guardar alterações',
					type: 'error',
				});
			}
			useToast.update(toastId, {
				loading: false,
				message: 'As alterações foram guardadas.',
				title: 'Anotação guardada com sucesso',
				type: 'success',
			});
			form.resetDirty();
		}
		catch (error) {
			useToast.update(toastId, {
				loading: false,
				message: error.message,
				title: 'Erro ao guardar alterações',
				type: 'error',
			});
		}
		finally {
			vehicleMutate();
			vehiclesListMutate();
			setIsSaving(false);
		}
	};

	const handleDeleteVehicle = async () => {
		try {
			const response = await fetchData<Vehicle>(API_ROUTES.dates.VEHICLE_DETAIL(vehicleId), 'DELETE', vehicleData);
			if (response.error) {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({ message: error.message, title: 'Erro ao apagar ocorrência' });
				}
				return;
			}

			useToast.success({ message: 'Anotação apagada com sucesso', title: 'Sucesso' });

			router.replace(PAGE_ROUTES.dates.ANNOTATIONS_LIST);
		}
		catch (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao apagar ocorrência',
			});
		}
		finally {
			vehiclesListMutate();
		}
	};

	const handleToggleLock = async () => {
		try {
			const response = await fetchData<Vehicle>(API_ROUTES.dates.VEHICLE_DETAIL_TOGGLE_LOCK(vehicleId));
			if (response.error) {
				return useToast.error({
					message: response.error,
					title: 'Erro ao bloquear anotação',
				});
			}
		}
		catch (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao bloquear anotação',
			});
		}
		finally {
			vehicleMutate();
			vehiclesListMutate();
		}
	};

	//
	// F. Define context value

	const contextValue: VehiclesDetailContextState = useMemo(() => ({
		actions: {
			deleteVehicle: handleDeleteVehicle,
			saveVehicle: handleSaveVehicle,
			toggleLock: handleToggleLock,
		},
		data: {
			form,
			id: vehicleId,
			vehicle: vehicleData,
		},
		flags: {
			error: vehicleError,
			loading: vehicleLoading,
			read_only: vehicleData?.is_locked || vehicleLoading || isSaving,
			saving: isSaving,
		},
	}), [
		vehicleData,
		vehicleError,
		vehicleLoading,
		vehicleId,
		form,
		isSaving,
	]);

	//
	// G. Render components

	return (
		<VehiclesDetailContext.Provider value={contextValue}>
			{children}
		</VehiclesDetailContext.Provider>
	);

	//
};
