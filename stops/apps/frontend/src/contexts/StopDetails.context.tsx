'use client';

import { uploadFile } from '@/lib/http';
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
		deleteImage: () => void
		deleteStop: () => void
		fileChanged: (file: File) => void
		saveStop: () => void
	}
	data: {
		form: UseFormReturnType<CreateStopDto>
		id: string | undefined
		imageUrl: string | undefined
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
	_id: '', // used
	bench_status: 'unknown',
	comments: [], // used
	connections: [], // used
	district_id: '', // used
	electricity_status: 'unknown',
	equipment: [],
	facilities: [],
	file_ids: [],
	has_bench: 'unknown', // used
	has_mupi: 'unknown', // used
	has_network_map: 'unknown', // used
	has_schedules: 'unknown', // used
	has_shelter: 'unknown', // used
	has_stop_sign: 'unknown', // used
	image_ids: [],
	is_archived: false,
	is_locked: false,
	jurisdiction: 'unknown', // used
	last_infrastructure_check: undefined, // used
	last_infrastructure_maintenance: undefined, // used
	last_schedules_check: undefined, // used
	last_schedules_maintenance: undefined, // used
	latitude: Number(0), // used
	legacy_id: '', // used
	locality_id: '', // used
	longitude: Number(0), // used
	municipality_id: '', // used
	name: '', // used
	new_name: '', // used
	operational_status: 'voided', // used
	parish_id: '', // used
	pole_status: 'unknown',
	road_type: 'unknown', // used
	shelter_code: '', // used
	shelter_frame_size: undefined,
	shelter_installation_date: undefined, // used
	shelter_maintainer: '', // used
	shelter_make: undefined,
	shelter_model: undefined,
	shelter_status: 'unknown', // used
	short_name: '', // used
	tts_name: '', // used
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
	const [image, setImage] = useState<File | null>(null);

	const { data: stop, error, isLoading } = useSWR<Stop>(stopId === 'new' ? null : Routes.API + Routes.STOPS_DETAIL(stopId), swrFetcher);
	const { data: imageUrl, isLoading: imageUrlLoading } = useSWR<undefined | { data: string, message: string }>(
		stopId === 'new'
			? undefined
			: Routes.API + Routes.STOPS_DETAIL(stopId),
		swrFetcher,
	);

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

	//
	// B. Define actions

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
					title: 'Erro ao salvar paragem',
				});
			}
			else {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({
						message: error.message,
						title: 'Erro ao salvar paragem',
					});
				}
			}

			// @ts-expect-error - idkhhnggggg
			const insertedId = stopId === 'new' ? (response.data as { data: { insertedId: string } }).data.insertedId : stopId;
			if (insertedId) {
				await uploadImage(insertedId);
			}

			// If the alert is new, redirect to the detail page
			if (insertedId && stopId === 'new') {
				router.replace(Routes.STOPS_DETAIL(insertedId));
			}

			setIsSaving(false);
			return;
		}

		useToast.success({
			message: 'Paragem salvo com sucesso',
			title: 'Sucesso',
		});

		if (stopId === 'new' && response.data?._id) {
			router.replace(Routes.STOPS_NEW);
		}

		setIsSaving(false);
	};

	const handleDeleterStop = async () => {
		if (stopId === 'new') return;

		const response = await fetchData<Stop>(Routes.API + Routes.STOPS_DETAIL(stopId), 'DELETE', stop);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao apagar paragem',
				});
			}
			return;
		}

		useToast.success({
			message: 'paragem apagado com sucesso',
			title: 'Sucesso',
		});

		router.push(Routes.STOPS_LIST, { scroll: false });
	};

	const deleteImage = async () => {
		if (stopId === 'new') return;

		const response = await fetchData<Stop>(Routes.API + Routes.STOPS_DETAIL(stopId), 'DELETE', alert);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao apagar imagem',
				});
			}
			return;
		}

		useToast.success({
			message: 'Imagem apagada com sucesso',
			title: 'Sucesso',
		});
	};

	const uploadImage = async (stopId: string) => {
		if (stopId === 'new' || !image) return;

		const response = await uploadFile(
			Routes.API + Routes.STOPS_DETAIL(stopId),
			image,
		);

		if (response.error) {
			useToast.error({
				message: response.error,
				title: 'Erro ao carregar imagem',
			});
			return;
		}

		useToast.success({
			message: 'A imagem foi carregada com sucesso',
			title: 'Imagem carregada com sucesso',
		});
	};

	const contextValue: StopDetailContextState = useMemo(() => ({
		actions: {
			deleteImage,
			deleteStop: handleDeleterStop,
			fileChanged: (file: File) => setImage(file),
			saveStop: handleSaveUser,
		},
		data: {
			form,
			id: stopId,
			imageUrl: imageUrl?.data,
			raw: stop,
		},
		flags: {
			canSave,
			error: error,
			isLoading: isLoading || imageUrlLoading,
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
