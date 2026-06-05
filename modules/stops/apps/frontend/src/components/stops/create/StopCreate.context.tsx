'use client';

import { closeCreateStopModal } from '@/components/stops/create/StopCreate.modal';
import { useLocationsContext } from '@/contexts/Locations.context';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { isValidLatitude, isValidLongitude } from '@tmlmobilidade/geo';
import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-stops-pckg-organize';
import { type CreateStopDto, CreateStopSchema, type Stop, StopSchema } from '@tmlmobilidade/types';
import { keepUrlParams, UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

/* * */

interface StopCreateContextState {
	actions: {
		createNewStop: () => void
		setLatLng: (latitude: number, longitude: number) => void
	}
	data: {
		coordinates: [number | undefined, number | undefined]
		form: UseFormReturnType<CreateStopDto>
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

	const locationsContext = useLocationsContext();

	const [isError, setIsError] = useState<Error | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const [modalCurrentStepState, setModalCurrentStepState] = useState<number>(1);
	const [modalCurrentStepValidState, setModalCurrentStepValidState] = useState<boolean>(false);
	const [coordinates, setCoordinates] = useState<[number | undefined, number | undefined]>([undefined, undefined]);
	const lastLoadedCoordsRef = useRef<null | { lat: number, lng: number }>(null);

	//
	// B. Fetch data

	const { mutate: allStopsMutate } = useSWR<Stop[]>(API_ROUTES.stops.STOPS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateStopDto>(CreateStopSchema);

	//
	// D. Handle actions

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

	const setLatLng = useCallback((latitude: number, longitude: number) => {
		setIsError(null);

		const validatedLatitude = isValidLatitude(latitude);
		const validatedLongitude = isValidLongitude(longitude);

		if (!validatedLatitude || !validatedLongitude) {
			setIsError(new Error('Coordenadas inválidas. Por favor verifique os valores introduzidos.'));
			return;
		}

		const { latitude: currentLat, longitude: currentLng } = form.getValues();
		if (currentLat === validatedLatitude && currentLng === validatedLongitude) return;

		setCoordinates([validatedLatitude, validatedLongitude]);
		form.setValues({ latitude: validatedLatitude, longitude: validatedLongitude });
	}, [form]);

	useEffect(() => {
		const validatedLatitude = isValidLatitude(coordinates[0] ?? NaN);
		const validatedLongitude = isValidLongitude(coordinates[1] ?? NaN);
		if (validatedLatitude === false || validatedLongitude === false) return;

		const latitude = validatedLatitude;
		const longitude = validatedLongitude;

		if (lastLoadedCoordsRef.current?.lat === latitude && lastLoadedCoordsRef.current?.lng === longitude) return;
		lastLoadedCoordsRef.current = { lat: latitude, lng: longitude };

		let cancelled = false;

		async function loadLocations() {
			const locationData = await locationsContext.actions.queryLocations(latitude, longitude);
			if (cancelled) return;

			const current = form.getValues();
			const district_id = locationData?.district?._id;
			const locality_id = locationData?.locality?._id;
			const municipality_id = locationData?.municipality?._id;
			const parish_id = locationData?.parish?._id;

			if (
				current.district_id === district_id
				&& current.locality_id === locality_id
				&& current.municipality_id === municipality_id
				&& current.parish_id === parish_id
			) return;

			form.setValues({ district_id, locality_id, municipality_id, parish_id });
		}

		void loadLocations();

		return () => {
			cancelled = true;
		};
	}, [coordinates, form, locationsContext.actions]);

	const validateCurrentStep = () => {
		// Get latest form values
		const currentValues = form.getValues();
		// By default, set the current step as invalid
		setModalCurrentStepValidState(false);
		// Validate Step 1
		if (modalCurrentStepState === 1) {
			const hasValidLatitude = isValidLatitude(currentValues.latitude);
			const hasValidLongitude = isValidLongitude(currentValues.longitude);
			const hasValidDistrict = currentValues.district_id !== undefined;
			const hasValidMunicipality = currentValues.municipality_id !== undefined;
			const hasValidParish = true; // currentValues.parish_id !== undefined; // TODO - Verify missing parishes
			setModalCurrentStepValidState(hasValidLatitude && hasValidLongitude && hasValidDistrict && hasValidMunicipality && hasValidParish);
		}
		// Validate Step 2
		if (modalCurrentStepState === 2) {
			const hasNameWithinLimits = currentValues.name?.length >= StopSchema.shape.name.minLength && currentValues.name?.length <= StopSchema.shape.name.maxLength;
			const hasShortNameWithinLimits = currentValues.short_name?.length >= StopSchema.shape.short_name.minLength && currentValues.short_name?.length <= StopSchema.shape.short_name.maxLength;
			setModalCurrentStepValidState(hasNameWithinLimits && hasShortNameWithinLimits);
		}
		// Validate Step 3
		if (modalCurrentStepState === 3) {
			setModalCurrentStepValidState(true);
		}
	};

	form.watch('name', validateCurrentStep);
	form.watch('short_name', validateCurrentStep);
	form.watch('tts_name', validateCurrentStep);
	form.watch('latitude', validateCurrentStep);
	form.watch('longitude', validateCurrentStep);
	form.watch('district_id', validateCurrentStep);
	form.watch('municipality_id', validateCurrentStep);
	form.watch('parish_id', validateCurrentStep);
	useEffect(validateCurrentStep, [modalCurrentStepState]);

	form.watch('name', ({ value }) => {
		// Skip if no name is set
		if (typeof value !== 'string') return;
		// Build the abbreviated and TTS names
		const shortName = getStopShortName(value);
		const ttsName = getStopTtsName(value);
		// Set the form values
		form.setFieldValue('short_name', shortName);
		form.setFieldValue('tts_name', ttsName);
	});

	const handleCreateStop = async () => {
		setIsSaving(true);
		const response = await fetchData<Stop>(API_ROUTES.stops.STOPS_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao criar organização' });
				setIsSaving(false);
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao criar organização' });
			}
			setIsSaving(false);
			return;
		}
		form.reset();
		setCoordinates([undefined, undefined]);
		lastLoadedCoordsRef.current = null;
		allStopsMutate();
		setIsSaving(false);
		closeCreateStopModal();
		useToast.success({ message: 'Paragem criada com sucesso', title: 'Sucesso' });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.stops.STOPS_DETAIL(String(response.data._id))));
	};

	//
	// E. Define context value

	const contextValue: StopCreateContextState = useMemo(() => ({
		actions: {
			createNewStop: handleCreateStop,
			setLatLng,
		},
		data: {
			coordinates,
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
	}), [
		coordinates,
		form,
		isError,
		isSaving,
		modalCurrentStepState,
		modalCurrentStepValidState,
		setLatLng,
	]);

	//
	// F. Render components

	return (
		<StopCreateContext.Provider value={contextValue}>
			{children}
		</StopCreateContext.Provider>
	);

	//
};
