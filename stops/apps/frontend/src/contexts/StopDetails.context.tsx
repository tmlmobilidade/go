'use client';

import { Routes } from '@/lib/routes';
import { CreateStopDto, CreateStopSchema, Stop, StopSchema, UpdateStopSchema } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { convertObject, fetchData, swrFetcher } from '@tmlmobilidade/utils';
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
	latitude: Number(0),
	legacy_id: '',
	locality_id: '',
	longitude: Number(0),
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
		// @ts-expect-error - idkhhnggggg
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
		form.validate();
		setCanSave(form.isValid());
	}, [form.values]);

	useEffect(() => {
		console.log('=========>', form.values);
	}, [form.values]);
	//
	// D. Define actions

	const handleSaveUser = async () => {
		setIsSaving(true);

		const saveStop: CreateStopDto = { ...form.values };

		const method = stopId === 'new' ? 'POST' : 'PUT';
		const url = stopId === 'new' ? Routes.API + Routes.STOPS_LIST : Routes.API + Routes.STOPS_DETAIL(stopId);
		const body = stopId === 'new' ? saveStop : convertObject(saveStop, UpdateStopSchema);

		const response = await fetchData<Stop>(url, method, body);

		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({
					message: response.error,
					title: 'Erro ao salvar utilizador',
				});
				console.log('---------> aki no if ');
			}
			else {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({
						message: error.message,
						title: 'Erro ao salvar utilizador',
					});
					console.log('---------> aki no for ');
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
