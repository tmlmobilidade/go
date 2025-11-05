'use client';

/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { StopOptions } from '@/schemas/options';
import { abbreviateName } from '@/utils/abreviate-stop-name';
import { type CreateStopDto, Stop } from '@go/types';
import { useForm, UseFormReturnType } from '@go/ui';
import { fetchData, isValidLatitude, isValidLongitude, keepUrlParams } from '@go/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

const emptyStop: CreateStopDto = {
	bench_status: 'unknown',
	comments: [],
	connections: [],
	district_id: '',
	electricity_status: 'unknown',
	equipment: [],
	facilities: [],
	file_ids: [],
	has_bench: 'unknown',
	has_mupi: 'unknown',
	has_network_map: 'unknown',
	has_schedules: 'unknown',
	has_shelter: 'unknown',
	has_stop_sign: 'unknown',
	image_ids: [],
	is_archived: false,
	is_locked: false,
	jurisdiction: 'unknown',
	last_infrastructure_check: undefined,
	last_infrastructure_maintenance: undefined,
	last_schedules_check: undefined,
	last_schedules_maintenance: undefined,
	latitude: 0,
	legacy_id: '',
	locality_id: '',
	longitude: 0,
	municipality_id: '',
	name: '',
	new_name: '',
	operational_status: 'voided',
	parish_id: '',
	pole_status: 'unknown',
	road_type: 'unknown',
	shelter_code: '',
	shelter_frame_size: undefined,
	shelter_installation_date: undefined,
	shelter_maintainer: '',
	shelter_make: undefined,
	shelter_model: undefined,
	shelter_status: 'unknown',
	short_name: '',
	tts_name: '',
};

/* * */

interface StopCreateContextState {
	actions: {
		createNewStop: () => void
		setLatLng: (latitude: number, longitude: number) => void
	}
	data: {
		form: UseFormReturnType<CreateStopDto>
	}
	flags: {
		error: Error | null
		loading: boolean
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

	const locationsContext = useLocationsContext();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<Error | null>(null);

	const [modalCurrentStepState, setModalCurrentStepState] = useState<number>(1);
	const [modalCurrentStepValidState, setModalCurrentStepValidState] = useState<boolean>(false);

	//
	// B. Fetch data

	const { mutate: allStopsMutate } = useSWR<Stop[]>('/api/stops');

	//
	// C. Setup form

	const form = useForm<CreateStopDto>({
		initialValues: emptyStop,
		// validate: validationSchema,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

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

	const setLatLng = (latitude: number, longitude: number) => {
		// Reset any existing errors
		setIsError(null);
		// Validate the input values
		const validatedLatitude = isValidLatitude(latitude);
		const validatedLongitude = isValidLongitude(longitude);
		// If they are invalid set field errors
		if (!validatedLatitude || !validatedLongitude) {
			setIsError(new Error('Coordenadas inválidas. Por favor verifique os valores introduzidos.'));
			return;
		}
		// Update the form with the validated values
		form.setValues({ latitude: validatedLatitude, longitude: validatedLongitude });
	};

	useEffect(() => {
		// By default, set the current step as invalid
		setModalCurrentStepValidState(false);
		// Validate Step 1
		if (modalCurrentStepState === 1) {
			const hasValidLatitude = isValidLatitude(form.values.latitude);
			const hasValidLongitude = isValidLongitude(form.values.longitude);
			const hasValidDistrict = form.values.district_id !== undefined;
			const hasValidMunicipality = form.values.municipality_id !== undefined;
			const hasValidParish = true; // form.values.parish_id !== undefined; // TODO - Verify missing parishes
			setModalCurrentStepValidState(hasValidLatitude && hasValidLongitude && hasValidDistrict && hasValidMunicipality && hasValidParish);
		}
		// Validate Step 2
		if (modalCurrentStepState === 2) {
			const hasNameWithinLimits = form.values.name.length >= StopOptions.stop_name_min_length && form.values.name.length <= StopOptions.stop_name_max_length;
			const hasShortNameWithinLimits = form.values.short_name.length >= StopOptions.stop_short_name_min_length && form.values.short_name.length <= StopOptions.stop_short_name_max_length;
			setModalCurrentStepValidState(hasNameWithinLimits && hasShortNameWithinLimits);
		}
		// Validate Step 3
		if (modalCurrentStepState === 3) {
			setModalCurrentStepValidState(true);
		}
	}, [
		modalCurrentStepState,
		form.values.latitude,
		form.values.longitude,
		form.values.district_id,
		form.values.municipality_id,
		form.values.parish_id,
		form.values.name,
		form.values.short_name,
	]);

	useEffect(() => {
		// Skip if no coordinates are set
		if (!form.values.latitude || !form.values.longitude) return;
		// Fetch the locations API for the given coordinates
		(async () => {
			const locationData = await locationsContext.actions.queryLocations(form.values.latitude, form.values.longitude);
			form.setValues({
				district_id: locationData?.district?._id,
				locality_id: locationData?.locality?._id,
				municipality_id: locationData?.municipality?._id,
				parish_id: locationData?.parish?._id,
			});
		})();
	}, [form.values.latitude, form.values.longitude]);

	useEffect(() => {
		// Skip if no name is set
		if (typeof form.values.name !== 'string') return;
		// Build the abreviated and TTS names
		const shortName = abbreviateName(form.values.name);
		const ttsName = form.values.name.replace(/\s+/g, ' ').trim();
		// Set the form values
		form.setValues({ short_name: shortName, tts_name: ttsName });
	}, [form.values.name]);

	const createNewStop = async () => {
		// Update UI
		setIsLoading(true);
		// Fetch the API with the new stop data
		const response = await fetchData<Stop>('/api/stops', 'POST', form.getValues());
		// Handle the API response error
		if (response.error) {
			setIsError(new Error(response.error));
			setIsLoading(false);
			return;
		}
		// Handle the success
		allStopsMutate();
		window.location.href = keepUrlParams(`/stops/${response.data._id}`, window.location.search);
	};

	//
	// E. Define context value

	const contextValue: StopCreateContextState = useMemo(() => ({
		actions: {
			createNewStop,
			setLatLng,
		},
		data: {
			form,
		},
		flags: {
			error: isError,
			loading: isLoading,
		},
		modal: {
			current_step: modalCurrentStepState,
			current_step_valid: modalCurrentStepValidState,
			nextStep,
			previousStep,
		},
	}), [
		form,
		isError,
		isLoading,
		modalCurrentStepState,
		modalCurrentStepValidState,
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
