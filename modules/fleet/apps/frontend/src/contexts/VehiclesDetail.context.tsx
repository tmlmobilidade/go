'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { SimplifiedVehicleEvent, type UpdateVehicleDto, UpdateVehicleSchema, type Vehicle } from '@tmlmobilidade/types';
import { UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData, unauthenticatedSwrFetcher } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
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
		position: null | SimplifiedVehicleEvent
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

	const { mutate: vehiclesListMutate } = useSWR<Vehicle[]>(API_ROUTES.fleet.VEHICLES_LIST);
	const { data: vehicleData, error: vehicleError, isLoading: vehicleLoading, mutate: vehicleMutate } = useSWR<Vehicle>(API_ROUTES.fleet.VEHICLES_DETAIL(vehicleId), unauthenticatedSwrFetcher, { refreshInterval: 5_000 });
	const { data: vehiclePositions } = useSWR<SimplifiedVehicleEvent>(API_ROUTES.fleet.VEHICLES_DETAIL_LAST_EVENT(vehicleId), { refreshInterval: 1_000 });

	//
	// C. Setup form

	const { formRef } = useTypicalForm<UpdateVehicleDto>(UpdateVehicleSchema, vehicleData);

	//
	// D. Transform data

	useEffect(() => {
		if (!vehicleError) return;
		useToast.error({ message: vehicleError.message, title: 'Erro ao abrir veículo' });
	}, [vehicleLoading]);

	//
	// E. Handle actions

	const handleSaveVehicle = async () => {
		setIsSaving(true);

		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A guardar veículo',
		});

		try {
			const response = await fetchData<Vehicle>(API_ROUTES.fleet.VEHICLES_DETAIL(vehicleId), 'PUT', formRef.current.getValues());
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
				title: 'Veículo guardado com sucesso',
				type: 'success',
			});
			formRef.current.resetDirty();
		} catch (error) {
			useToast.update(toastId, {
				loading: false,
				message: error.message,
				title: 'Erro ao guardar alterações',
				type: 'error',
			});
		} finally {
			vehicleMutate();
			vehiclesListMutate();
			setIsSaving(false);
		}
	};

	//

	const handleDeleteVehicle = async () => {
		try {
			const response = await fetchData<Vehicle>(API_ROUTES.fleet.VEHICLES_DETAIL(vehicleId), 'DELETE', vehicleData);
			if (response.error) {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({ message: error.message, title: 'Erro ao apagar ocorrência' });
				}
				return;
			}

			useToast.success({ message: 'veículo apagado com sucesso', title: 'Sucesso' });

			router.replace(PAGE_ROUTES.fleet.VEHICLES_LIST);
		} catch (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao apagar veículo',
			});
		} finally {
			vehiclesListMutate();
		}
	};

	//

	const handleToggleLock = async () => {
		try {
			const response = await fetchData<Vehicle>(API_ROUTES.fleet.VEHICLES_DETAIL_LOCK(vehicleId));
			if (response.error) {
				return useToast.error({
					message: response.error,
					title: 'Erro ao bloquear veículo',
				});
			}
		} catch (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao bloquear veículo',
			});
		} finally {
			vehicleMutate();
			vehiclesListMutate();
		}
	};

	//
	// F. Define context value

	const contextValue: VehiclesDetailContextState = {
		actions: {
			deleteVehicle: handleDeleteVehicle,
			saveVehicle: handleSaveVehicle,
			toggleLock: handleToggleLock,
		},
		data: {
			form: formRef.current,
			id: vehicleId,
			position: vehiclePositions,
			vehicle: vehicleData,
		},
		flags: {
			error: vehicleError,
			loading: vehicleLoading,
			read_only: vehicleData?.is_locked || vehicleLoading || isSaving,
			saving: isSaving,
		},
	};

	//
	// G. Render components

	return (
		<VehiclesDetailContext.Provider value={contextValue}>
			{children}
		</VehiclesDetailContext.Provider>
	);

	//
};
