'use client';

import { Routes } from '@/lib/routes';
import { CreateStopDto, CreateStopSchema, Stop, StopSchema } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, zodResolver } from '@tmlmobilidade/ui';
import { swrFetcher } from '@tmlmobilidade/utils';
import { createContext, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopDetailContextState {
	data: {
		form: UseFormReturnType<CreateStopDto>
		id: string | undefined
		raw: Stop
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

/* * */

const emptyStop: CreateStopDto = {
	_id: '',
	affectation: [],
	bench_status: 'unknown',
	comments: [],
	connections: [],
	district_id: '',
	docking_bay_type: 'unknown',
	electricity_status: 'unknown',
	facilities: [],
	file_ids: [],
	flag_status: 'unknown',
	image_ids: [],
	is_archived: false,
	is_locked: false,
	jurisdiction: 'unknown',
	last_infrastructure_check: undefined,
	last_infrastructure_maintenance: undefined,
	last_schedules_check: undefined,
	last_schedules_maintenance: undefined,
	last_shelter_installation: undefined,
	latitude: -1.01,
	lighting_status: 'unknown',
	locality_id: 'temp',
	longitude: 8.999,
	municipality_id: 'temp123',
	name: 'temp',
	new_name: 'Rua Dom Francisco',
	observations: '',
	operational_status: 'inactive',
	parish_id: 'temp',
	pavement_type: 'unknown',
	pole_status: 'unknown',
	road_type: 'unknown',
	shelter_code: 'temp',
	shelter_maintainer: 'temp',
	shelter_make: 'temp',
	shelter_model: 'temp',
	shelter_status: 'unknown',
	short_name: 'R. D. Francisco',
	sidewalk_type: 'unknown',
	tts_name: 'temp',
};

/* * */

const StopDetailContext = createContext<StopDetailContextState | undefined>(undefined);

export const useStopDetailContext = () => {
	const context = useContext(StopDetailContext);
	if (!context) {
		throw new Error('useStopDetailContext must be used within an StopDetailContextProvider');
	}
	return context;
};

/* * */

export const StopDetailContextProvider = ({ children, stopId }: { children: React.ReactNode, stopId: string }) => {
	//

	//
	// A. declare variables

	const { data: stop, error, isLoading } = useSWR<Stop>(stopId === 'new' ? null : Routes.API + Routes.STOPS_DETAIL(stopId), swrFetcher);

	const form = useForm<CreateStopDto>({
		initialValues: stop || emptyStop,
		validate: zodResolver(stop ? StopSchema : CreateStopSchema) as unknown as FormValidateInput<CreateStopDto>,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	useEffect(() => {
		if (!stop) return;

		form.reset();
		form.setValues(stop);
		form.resetDirty();
	}, [stop]);

	// Validate form on change
	useEffect(() => {
		console.log('=========>', form.values);
	}, [form.values]);

	//
	// D. Define actions
	const contextValue: StopDetailContextState = useMemo(() => ({
		data: {
			form,
			id: stopId,
			raw: stop,
		},
		flags: {
			error: error,
			isLoading: isLoading,
		},
	}), [stop, isLoading, error, form]);

	return (
		<StopDetailContext.Provider value={contextValue}>
			{children}
		</StopDetailContext.Provider>
	);
};
