'use client';

/* * */

import { CREATE_STOP_MODAL_ID } from '@/components/Stops/Detail/CreateStopModal';
import { type WorkerMessage } from '@/types/worker';
import { Permissions } from '@tmlmobilidade/lib';
import { CreateStopDto, Stop, StopPermission } from '@tmlmobilidade/types';
import { closeModal, useForm, UseFormReturnType, useMeContext, useToast } from '@tmlmobilidade/ui';
import { multipartFetch } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mutate } from 'swr';

/* * */

interface StopCreateContextState {
	actions: {
		createStop: () => void
	}
	data: {
		form: UseFormReturnType<CreateStopDto>
	}
	flags: {
		can_create: boolean
		error: Error | null
		loading: boolean
	}
}

/* * */

const StopCreateContext = createContext<StopCreateContextState | undefined>(undefined);

export function useStopCreateContext() {
	const context = useContext(StopCreateContext);
	if (!context) {
		throw new Error('useStopCreateContext must be used within a StopCreateContextProvider');
	}
	return context;
}

/* * */

export const StopCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const workerRef = useRef<null | Worker>(null);
	const meContext = useMeContext();

	const [isLoading, setIsLoading] = useState(false);
	const [canCreate, setCanCreate] = useState(false);
	const [stopError, setStopError] = useState<Error | null>(null);

	//
	// B. Setup form

	const form = useForm<CreateStopDto>({
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Handle actions

	const handleWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
		//

		if (event.data.error) {
			useToast.error({ message: event.data.error.message, title: 'Erro ao criar Paragem' });
			return;
		}

		//

		form.setValues({
			latitude: event.data.stop.stop_lat,
			longitude: event.data.stop.stop_lon,
			name: event.data.stop.stop_name,
		});

		//

		const hasPermission = meContext.actions.hasPermissionResource<StopPermission>({
			action: Permissions.stops.actions.create,
			resource_key: 'agency_ids',
			scope: Permissions.stops.scope,
			value: event.data.stop,
		});

		if (!hasPermission) {
			setCanCreate(false);
			setStopError({
				message: 'Não é permitido criar uma paragem.',
				name: 'StopError',
			});
			return;
		}

		setCanCreate(true);

		//
	};

	const createStop = async () => {
		//

		setIsLoading(true);

		//

		const uploadFormData = new FormData();

		uploadFormData.append('stop_name', form.values.name);
		uploadFormData.append('stop_lat', JSON.stringify(form.values.latitude));
		uploadFormData.append('stop_lon', JSON.stringify(form.values.longitude));

		//

		const response = await multipartFetch<Stop>('/api/stops', uploadFormData);

		//

		if (response.error || !response.data?._id) {
			useToast.error({ message: response.error, title: 'Erro ao iniciar Validação' });
			setIsLoading(false);
			return;
		}

		if (!response.data?._id) {
			useToast.error({ message: response.error, title: 'Erro ao iniciar Validação' });
			setIsLoading(false);
			return;
		}

		router.push(`/stops/${response.data._id}`);

		useToast.success({
			message: 'Paragem criada com sucesso.',
			title: 'Sucesso',
		});

		//
		// Reset the form and state

		setIsLoading(false);
		closeModal(CREATE_STOP_MODAL_ID);
		mutate('/api/stops');
	};

	//

	useEffect(() => {
	// Reset form and flags if there's an error
		if (stopError) {
			setCanCreate(false);
			form.reset();
			return;
		}

		// Clean up any existing worker
		if (workerRef.current) {
			workerRef.current.terminate();
		}

		const worker = new Worker(new URL('@/types/worker.ts', import.meta.url));
		workerRef.current = worker;

		workerRef.current.onmessage = handleWorkerMessage;

		return () => {
			if (workerRef.current) {
				workerRef.current.terminate();
				workerRef.current = null;
			}
		};
	}, [stopError]);

	//
	// E. Define context value

	const contextValue: StopCreateContextState = useMemo(() => {
		return {
			actions: {
				createStop,
			},
			data: {
				form: form,
			},
			flags: {
				can_create: canCreate,
				error: stopError,
				loading: isLoading,
			},
		};
	}, [
		form,
		isLoading,
		canCreate,
		stopError,
	]);

	//
	// F. Render components

	return (
		<StopCreateContext.Provider value={contextValue}>
			{children}
		</StopCreateContext.Provider>
	);
};
