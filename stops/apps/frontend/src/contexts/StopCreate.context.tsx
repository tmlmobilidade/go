'use client';

/* * */

import { CREATE_STOP_MODAL_ID } from '@/components/Stops/Detail/CreateStopModal/CreateStopName';
import { StopOptions } from '@/schemas/options';
import { type WorkerMessage } from '@/types/worker';
import { getAppConfig, Permissions } from '@tmlmobilidade/lib';
import { CreateStopDto, Location, Stop, StopPermission } from '@tmlmobilidade/types';
import { closeModal, useForm, UseFormReturnType, useMeContext, useToast } from '@tmlmobilidade/ui';
import { fetchData, multipartFetch } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mutate } from 'swr';

/* * */

const initialNewStopState = {
	district: '',
	latitude: null,
	longitude: null,
	municipality: '',
	parish: '',
	//
	name: '',
	short_name: '',
	tts_name: '',
	//
};

interface initialNewStopStateProps {
	district: string
	latitude: number
	longitude: number
	municipality: string
	//
	name: string
	parish: string
	short_name: string
	tts_name: string
}

interface StopCreateContextState {
	actions: {
		abbreviationsShortName: (name: string) => void
		closeCreateStopModalAndReset: () => void
		createStop: () => void
		createStopCoordinates: (latitude: number, longitude: number) => void
	}
	data: {
		form: UseFormReturnType<CreateStopDto>
		newStopState: initialNewStopStateProps
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
	const router = useRouter();
	const workerRef = useRef<null | Worker>(null);
	const meContext = useMeContext();

	const [isLoading, setIsLoading] = useState(false);
	const [canCreate, setCanCreate] = useState(false);
	const [stopError, setStopError] = useState<Error | null>(null);

	const [newStopState, setNewStopState] = useState<initialNewStopStateProps>(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('newStopState');
			if (stored) {
				try {
					return JSON.parse(stored);
				}
				catch {
					return initialNewStopState;
				}
			}
		}
		return initialNewStopState;
	});

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('newStopState', JSON.stringify(newStopState));
		}
	}, [newStopState]);

	//
	// B. Setup form

	const form = useForm<CreateStopDto>({
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Handle actions

	const handleWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
		if (event.data.error) {
			useToast.error({ message: event.data.error.message, title: 'Erro ao criar Paragem' });
			return;
		}

		form.setValues({
			latitude: event.data.stop.stop_lat,
			longitude: event.data.stop.stop_lon,
			name: event.data.stop.stop_name,
		});

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
	};

	const createStop = async () => {
		setIsLoading(true);
		console.log(form.values);

		const uploadFormData = new FormData();

		uploadFormData.append('stop_name', form.values.name);
		uploadFormData.append('stop_lat', JSON.stringify(form.values.latitude));
		uploadFormData.append('stop_lon', JSON.stringify(form.values.longitude));

		const response = await multipartFetch<Stop>('/api/stops', uploadFormData);

		if (response.error || !response.data?._id) {
			useToast.error({ message: response.error, title: 'Erro ao iniciar Validação' });
			setIsLoading(false);
			return;
		}

		router.push(`/stops/${response.data._id}`);

		useToast.success({
			message: 'Paragem criada com sucesso.',
			title: 'Sucesso',
		});

		localStorage.removeItem('newStopState');

		setIsLoading(false);
		closeModal(CREATE_STOP_MODAL_ID);
		mutate('/api/stops');
	};

	//
	const setNewStopAndLocation = useCallback(
		async (latitude: number, longitude: number) => {
			setNewStopState(prev => ({
				...prev,
				latitude: latitude,
				longitude: longitude,
			}));

			form.setValues({
				latitude: latitude,
				longitude: longitude,
			});

			try {
				const location = await fetchData<Location>(
					`${getAppConfig('locations', 'frontend_url', 'production')}/api/locations/coordinates?lon=${longitude}&lat=${latitude}`,
				);

				if (!location?.data) return;

				setNewStopState(prev => ({
					...prev,
					district: location.data.district.name,
					municipality: location.data.municipality.name,
					parish: location.data.parish.name,
				}));

				form.setValues({
					district_id: location.data.district._id,
					municipality_id: location.data.municipality._id,
					parish_id: location.data.parish._id,
				});
			}
			catch (error) {
				console.error('Error:', error);
			}
		},
		[],
	);

	const setNewStopName = useCallback((name) => {
		const parsedStopName = name.replace(/\s\s+/g, ' ');
		let shortenedStopName = parsedStopName;

		StopOptions.name_abbreviations
			.filter(abbreviation => abbreviation.enabled)
			.forEach((abbreviation) => {
				shortenedStopName = shortenedStopName.replace(abbreviation.phrase, abbreviation.replacement);
			});

		setNewStopState(prev => ({
			...prev,
			name: parsedStopName,
			short_name: shortenedStopName,
			tts_name: parsedStopName,
		}));

		form.setValues({
			name: name,
			short_name: shortenedStopName,
			tts_name: name,
		});
	}, []);

	const closeCreateStopModalAndReset = () => {
		closeModal(CREATE_STOP_MODAL_ID);
		setNewStopState(initialNewStopState);
		localStorage.removeItem('newStopState');
		form.reset();
	};

	useEffect(() => {
		if (stopError) {
			setCanCreate(false);
			form.reset();
			return;
		}

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

	useEffect(() => {
		const allFieldsFilled = Object.values(newStopState).every((value) => {
			if (typeof value === 'string') {
				return value.trim() !== '';
			}
			if (typeof value === 'number') {
				return !isNaN(value);
			}
			return value !== null && value !== undefined;
		});
		setCanCreate(allFieldsFilled);
	}, [newStopState]);

	//
	// E. Define context value

	console.log(newStopState);

	const contextValue: StopCreateContextState = useMemo(() => {
		return {
			actions: {
				abbreviationsShortName: setNewStopName,
				closeCreateStopModalAndReset,
				createStop,
				createStopCoordinates: setNewStopAndLocation,
			},
			data: {
				form: form,
				newStopState: newStopState,
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
		newStopState,
	]);

	//
	// F. Render components

	return (
		<StopCreateContext.Provider value={contextValue}>
			{children}
		</StopCreateContext.Provider>
	);
};
