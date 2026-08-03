'use client';

import { closeCreateStopModal } from '@/components/stops/create/StopCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { isValidLatitude, isValidLongitude } from '@tmlmobilidade/geo';
import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-stops-pckg-organize';
import { type CreateStopDto, CreateStopSchema, type Stop, StopSchema } from '@tmlmobilidade/types';
import { keepUrlParams, useContextForm, useContextFormWatch, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface StopCreateContextState {
	actions: {
		createNewStop: () => void
		setLatLng: (latitude: number, longitude: number) => void
	}
	data: {
		coordinates: [number | undefined, number | undefined]
		form: ReturnType<typeof useContextForm<CreateStopDto>>['form']
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

	const [isError, setIsError] = useState<Error | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const [modalCurrentStepState, setModalCurrentStepState] = useState<number>(1);
	const [modalCurrentStepValidState, setModalCurrentStepValidState] = useState<boolean>(false);
	const [coordinates, setCoordinates] = useState<[number | undefined, number | undefined]>([undefined, undefined]);

	//
	// B. Fetch data

	const { mutate: allStopsMutate } = useSWR<Stop[]>(API_ROUTES.stops.STOPS_LIST);

	//
	// C. Setup form

	const { form } = useContextForm<CreateStopDto>({});
	const nameValue = useContextFormWatch({ control: form.control, name: 'name' });
	const shortNameValue = useContextFormWatch({ control: form.control, name: 'short_name' });
	const latitudeValue = useContextFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useContextFormWatch({ control: form.control, name: 'longitude' });
	const districtIdValue = useContextFormWatch({ control: form.control, name: 'district_id' });
	const municipalityIdValue = useContextFormWatch({ control: form.control, name: 'municipality_id' });

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
		form.setValue('latitude', validatedLatitude);
		form.setValue('longitude', validatedLongitude);
	}, [form]);

	useEffect(() => {
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
	}, [districtIdValue, form, latitudeValue, longitudeValue, modalCurrentStepState, municipalityIdValue, nameValue, shortNameValue]);

	useEffect(() => {
		if (typeof nameValue !== 'string') return;
		// Build the abbreviated and TTS names
		const shortName = getStopShortName(nameValue);
		const ttsName = getStopTtsName(nameValue);
		// Set the form values
		form.setValue('short_name', shortName);
		form.setValue('tts_name', ttsName);
	}, [form, nameValue]);

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
