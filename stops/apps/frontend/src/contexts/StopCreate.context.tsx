'use client';

/* * */

import { CREATE_STOP_MODAL_ID } from '@/components/Stops/Detail/CreateStopModal/CreateStopName';
import { StopOptions } from '@/schemas/options';
import { type WorkerMessage } from '@/types/worker';
import { getAppConfig, Permissions } from '@tmlmobilidade/lib';
import { CreateStopDto, Municipality, Stop, StopPermission } from '@tmlmobilidade/types';
import { closeModal, useForm, UseFormReturnType, useMeContext, useToast } from '@tmlmobilidade/ui';
import { HttpResponse, multipartFetch } from '@tmlmobilidade/utils';
import * as turf from '@turf/turf';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

const initialNewStopState = {
	latitude: null,
	locality: '',
	longitude: null,
	municipality: null,
	//
	name: '',
	short_name: '',
	tts_name: '',
	//
};

interface StopCreateContextState {
	actions: {
		abbreviationsShortName: (name: string) => void
		createStop: () => void
		createStopCoordinates: (latitude: number, longitude: number) => void
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

	const [newStopState, setNewStopState] = useState(initialNewStopState);

	const { data: allMunicipalitiesData } = useSWR<HttpResponse<Municipality[]>, Error>(`${getAppConfig('locations', 'api_url', 'production')}/locations/municipalities`);

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

	const setNewStopCoordinates = useCallback(
		(latitude, longitude) => {
			if (!allMunicipalitiesData.data.length) return;
			// Round coordinates to 6 decimal digits
			const sixDigitsLatitude = Math.round(latitude);
			const sixDigitsLongitude = Math.round(longitude);
			// Discover to which municipality this stop belongs to
			let municipalityDataForThisStop;
			for (const municipalityData of allMunicipalitiesData.data) {
				// Skip if no geometry is set for this municipality
				if (!municipalityData.geojson?.geometry?.coordinates.length) continue;
				// Check if this stop is inside this municipality boundary
				const isStopInThisMunicipality = turf.booleanPointInPolygon([sixDigitsLongitude, sixDigitsLatitude], municipalityData.geojson);
				// If it is, add this municipality id to the stop
				if (isStopInThisMunicipality) {
					municipalityDataForThisStop = municipalityData;
					break;
				}
				//
			}
			console.log(latitude, longitude);
			// Set new stop info
			setNewStopState(prev => ({ ...prev, latitude: sixDigitsLatitude, longitude: sixDigitsLongitude, municipality: municipalityDataForThisStop }));

			form.setValues({
				latitude: latitude,
				longitude: longitude,
			});
		},
		[allMunicipalitiesData],
	);

	//

	const setNewStopName = useCallback((name) => {
		// Remove double spaces
		const parsedStopName = name.replace(/\s\s+/g, ' ');
		// Copy the name first
		let shortenedStopName = parsedStopName;
		// Shorten the stop name
		StopOptions.name_abbreviations
			.filter(abbreviation => abbreviation.enabled)
			.forEach((abbreviation) => {
				shortenedStopName = shortenedStopName.replace(abbreviation.phrase, abbreviation.replacement);
			});
		// Set new stop info
		setNewStopState(prev => ({ ...prev, name: parsedStopName, short_name: shortenedStopName }));
		form.setValues({
			short_name: shortenedStopName,
		});
	}, []);

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
				abbreviationsShortName: setNewStopName,
				createStop,
				createStopCoordinates: setNewStopCoordinates,
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
