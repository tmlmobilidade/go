'use client';

import { Routes } from '@/lib/routes';
import { CreateStopDto, CreateStopSchema, Stop, StopSchema } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData, swrFetcher } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export enum StopDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

/* * */

interface StopDetailContextState {
	actions: {
		deleteStop: () => void
		saveStop: () => void
	}
	data: {
		form: UseFormReturnType<CreateStopDto>
		id: string | undefined
		raw: Stop
	}
	flags: {
		canSave: boolean
		error: Error | undefined
		isLoading: boolean
		isReadOnly: boolean
		isSaving: boolean
		mode: StopDetailMode
	}
}

/* * */

const emptyStop: CreateStopDto = {
	_id: '',
	affectation: [],
	bench_status: 'UNKNOWN',
	comments: [],
	connections: [],
	district_id: '',
	docking_bay_type: 'UNKNOWN',
	electricity_status: 'UNKNOWN',
	facilities: [],
	file_ids: [],
	flag_status: 'UNKNOWN',
	has_bench: 'UNKNOWN',
	has_network_map: 'UNKNOWN',
	has_pip_real_time: 'UNKNOWN',
	has_schedules: 'UNKNOWN',
	has_shelter: 'UNKNOWN',
	has_stop_sign: 'UNKNOWN',
	has_tariffs_information: 'UNKNOWN',
	image_ids: [],
	is_archived: false,
	is_locked: false,
	jurisdiction: 'UNKNOWN',
	last_infrastructure_check: undefined,
	last_infrastructure_maintenance: undefined,
	last_schedules_check: undefined,
	last_schedules_maintenance: undefined,
	last_shelter_installation: undefined,
	latitude: -1.01,
	lighting_status: 'UNKNOWN',
	locality_id: 'temp',
	longitude: 8.999,
	municipality_id: 'temp123',
	name: 'temp',
	new_name: 'Rua Dom Francisco',
	observations: '',
	operational_status: 'INACTIVE',
	parish_id: 'temp',
	pavement_type: 'UNKNOWN',
	pole_status: 'UNKNOWN',
	road_type: 'UNKNOWN',
	shelter_code: 'temp',
	shelter_maintainer: 'temp',
	shelter_make: 'temp',
	shelter_model: 'temp',
	shelter_status: 'UNKNOWN',
	short_name: 'R. D. Francisco',
	sidewalk_type: 'UNKNOWN',
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

	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);
	const [canSave, setCanSave] = useState(false);

	const { data: stop, error, isLoading } = useSWR<Stop>(stopId === 'new' ? null : Routes.API + Routes.STOPS_DETAIL(stopId), swrFetcher);

	const form = useForm<CreateStopDto>({
		initialValues: stop || emptyStop,
		validate: zodResolver(stop ? StopSchema : CreateStopSchema) as UNKNOWN as FormValidateInput<CreateStopDto>,
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

	useEffect(() => {
		form.validate();
		setCanSave(form.isValid());
	}, [form.values]);

	//
	// D. Define actions

	const handleSaveUser = async () => {
		setIsSaving(true);

		const response = await fetchData<Stop>(Routes.API + Routes.STOPS_DETAIL(stopId), 'POST', form.values);

		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({
					message: response.error,
					title: 'Erro ao salvar utilizador',
				});
			}
			else {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({
						message: error.message,
						title: 'Erro ao salvar utilizador',
					});
				}
			}

			setIsSaving(false);
			return;
		}

		useToast.success({
			message: 'Utilizador salvo com sucesso',
			title: 'Sucesso',
		});

		if (stopId === 'new' && response.data?._id) {
			router.replace(Routes.STOPS_NEW);
		}

		setIsSaving(false);
	};
	const handleDeleterStop = async () => {
		if (stopId === 'new') return;

		const response = await fetchData<Stop>(Routes.AUTH_API + Routes.STOPS_DETAIL(stopId), 'DELETE', stop);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao apagar utilizador',
				});
			}
			return;
		}

		useToast.success({
			message: 'Utilizador apagado com sucesso',
			title: 'Sucesso',
		});

		router.push(Routes.STOPS_LIST, { scroll: false });
	};
	const contextValue: StopDetailContextState = useMemo(() => ({
		actions: {
			deleteStop: handleDeleterStop,
			saveStop: handleSaveUser,
		},
		data: {
			form,
			id: stopId,
			raw: stop,
		},
		flags: {
			canSave,
			error: error,
			isLoading: isLoading,
			isReadOnly,
			isSaving,
			mode: stopId === 'new' ? StopDetailMode.CREATE : StopDetailMode.EDIT,
		},
	}), [stop, isLoading, error, form, canSave, isReadOnly, isSaving, stopId]);

	return (
		<StopDetailContext.Provider value={contextValue}>
			{children}
		</StopDetailContext.Provider>
	);
};
