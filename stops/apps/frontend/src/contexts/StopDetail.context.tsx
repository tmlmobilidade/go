'use client';

import { fetchData, swrFetcher, uploadFile } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { ShelterStatus } from '@tmlmobilidade/types';
import { SidewalkType } from '@tmlmobilidade/types';
import { RoadType } from '@tmlmobilidade/types';
import { PavementType } from '@tmlmobilidade/types';
import { LightningStatus } from '@tmlmobilidade/types';
import { FlagStatus } from '@tmlmobilidade/types';
import { ElectricityStatus } from '@tmlmobilidade/types';
import { Connections } from '@tmlmobilidade/types';
import { Comment } from '@tmlmobilidade/types';
import { DockingBayType } from '@tmlmobilidade/types';
import { Facilities } from '@tmlmobilidade/types';
import { Jurisdiction } from '@tmlmobilidade/types';
import { OperationalStatus } from '@tmlmobilidade/types';
import { PoleStatus } from '@tmlmobilidade/types';
import { causeSchema, CreateStopDto, CreateStopSchema, effectSchema, referenceTypeSchema, Stop, StopSchema, UnixTimestamp, UpdateStopSchema } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { convertObject, getUnixTimestamp } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

export enum StopDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

interface StopDetailContextState {
	actions: {
		// addReference: () => void
		deleteImage: () => void
		deleteStop: () => void
		imageChanged: (file: File) => void
		// removeReference: (index: number) => void
		// saveStop: (type: 'draft' | 'publish') => void
		saveStop: () => void
	}
	data: {
		_id: string | undefined
		// bench_status: 'unknown'
		// comments: Comment
		// connections: Connections
		// created_at: UnixTimestamp
		// district_id: string
		// docking_bay_type: DockingBayType
		// electricity_status: ElectricityStatus
		// facilities: Facilities
		// file_ids: string[]
		// flag_status: FlagStatus
		form: UseFormReturnType<CreateStopDto>
		// image_ids: string[]
		// // imageUrl: string | undefined
		// is_archived: boolean
		// is_locked: boolean
		// jurisdiction: Jurisdiction
		// last_infrastructure_check: UnixTimestamp
		// last_infrastructure_maintenance: UnixTimestamp
		// last_schedules_check: UnixTimestamp
		// last_schedules_maintenance: UnixTimestamp
		// latitude: number
		// lighting_status: LightningStatus
		// locality_id: string
		// longitude: number
		// municipality_id: string
		// name: string
		// new_name: string
		// observations: string
		// operational_status: OperationalStatus
		// parish_id: string
		// pavement_type: PavementType
		// pole_status: PoleStatus
		// road_type: RoadType
		// shelter_code: string
		// shelter_maintainer: string
		// shelter_make: string
		// shelter_model: string
		// shelter_status: ShelterStatus
		// short_name: string
		// sidewalk_type: SidewalkType
		// tts_name: string
		// updated_at: UnixTimestamp
	}
	flags: {
		canSave: boolean
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: StopDetailMode
	}
}

const emptyStop: CreateStopDto = {
	_id: 'temp',
	affectation: [],
	bench_status: 'unknown',
	comments: [],
	connections: [],
	created_at: getUnixTimestamp(),
	district_id: 'temp',
	docking_bay_type: undefined,
	electricity_status: 'unknown',
	facilities: [],
	file_ids: [],
	flag_status: 'unknown',
	image_ids: [],
	is_archived: false,
	is_locked: false,
	jurisdiction: 'unknown',
	last_infrastructure_check: getUnixTimestamp(),
	last_infrastructure_maintenance: getUnixTimestamp(),
	last_schedules_check: getUnixTimestamp(),
	last_schedules_maintenance: getUnixTimestamp(),
	last_shelter_installation: getUnixTimestamp(),
	latitude: 0,
	lighting_status: 'unknown',
	locality_id: 'temp',
	longitude: 0,
	municipality_id: 'temp',
	name: 'temp',
	new_name: 'temp',
	observations: 'concrete',
	operational_status: undefined,
	parish_id: 'temp',
	pavement_type: 'unknown',
	pole_status: 'unknown',
	road_type: 'unknown',
	shelter_code: 'temp',
	shelter_maintainer: 'temp',
	shelter_make: 'temp',
	shelter_model: 'temp',
	shelter_status: 'unknown',
	short_name: 'temp',
	sidewalk_type: 'unknown',
	tts_name: 'temp',
	updated_at: getUnixTimestamp(),
};

const StopDetailContext = createContext<StopDetailContextState | undefined>(undefined);

export function useStopDetailContext() {
	const context = useContext(StopDetailContext);
	if (!context) {
		throw new Error('useStopDetailContext must be used within a StopDetailContextProvider');
	}
	return context;
}

export const StopDetailContextProvider = ({ children, stopId }: { children: React.ReactNode, stopId: string }) => {
	//
	// A. Setup variables
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);
	const [canSave, setCanSave] = useState(false);
	const [image, setImage] = useState<File | null>(null);
	const [file, setFile] = useState<File | null>(null);

	const { data: stop, error, isLoading } = useSWR<Stop>(stopId === 'new' ? null : Routes.STOPS_API + Routes.STOP_DETAIL(stopId), swrFetcher);
	// console.log('==> stop', stop);
	const { data: imageUrl, isLoading: imageUrlLoading } = useSWR<undefined | { data: string, message: string }>(
		stopId === 'new'
			? undefined
			: Routes.STOPS_API + Routes.STOP_IMAGE(stopId),
		swrFetcher,
	);
	const { data: fileUrl, isLoading: fileUrlLoading } = useSWR<undefined | { data: string, message: string }>(
		stopId === 'new'
			? undefined
			: Routes.STOPS_API + Routes.STOP_FILE(stopId),
		swrFetcher,
	);

	//
	// B. Define form
	const form = useForm<CreateStopDto>({
		initialValues: stop || emptyStop,
		validate: zodResolver(stop ? StopSchema : CreateStopSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Transform Data

	// Update form
	useEffect(() => {
		if (!stop) return;

		setLoading(true);

		// if (!stop.reference_type) {
		// 	stop.reference_type = Object.values(referenceTypeSchema.Enum)[0];
		// 	stop.references = [];
		// }

		form.reset();
		form.setValues(stop);
		form.resetDirty();

		setLoading(false);
	}, [stop]);

	useEffect(() => {
		if (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao carregar paragem',
			});
			router.replace(Routes.STOP_LIST);
		}
	}, [error]);

	// Validate form on change
	useEffect(() => {
		form.validate();
		setCanSave(form.isValid());

		console.log(form.errors);
	}, [form.values]);

	//
	// D. Define actions
	// const addReference = () => {
	// 	const currentReferences = form.values.references || [];
	// 	currentReferences.push({ child_ids: [], parent_id: '' });
	// 	form.setFieldValue('references', currentReferences);
	// };

	// const removeReference = (index: number) => {
	// 	const currentReferences = form.values.references || [];
	// 	form.setFieldValue('references', currentReferences.filter((_, i) => i !== index));
	// };

	// const saveStop = async (type: 'draft' | 'publish') => {
	const saveStop = async () => {
		setIsSaving(true);

		// Handle Save Stop
		// const active_period_end_date = form.getValues().active_period_end_date ?? null;
		// const publish_end_date = form.getValues().publish_end_date ?? null;

		// const saveStop: CreateStopDto = { ...form.values, active_period_end_date, publish_end_date, publish_status: type === 'publish' ? 'PUBLISHED' : 'DRAFT' };
		// const saveStop: CreateStopDto = { ...form.values, active_period_end_date, publish_end_date };
		const saveStop: CreateStopDto = { ...form.values };

		const method = stopId === 'new' ? 'POST' : 'PUT';
		const url = stopId === 'new' ? Routes.STOPS_API + Routes.STOP_LIST : Routes.STOPS_API + Routes.STOP_DETAIL(stopId);
		let body = stopId === 'new' ? saveStop : convertObject(saveStop, UpdateStopSchema);

		// body = { ...body, active_period_end_date, publish_end_date };
		body = { ...body };

		const response = await fetchData<unknown>(url, method, body);

		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao salvar paragem',
				});
			}
			setIsSaving(false);
			return;
		}

		const insertedId = stopId === 'new' ? (response.data as { data: { insertedId: string } }).data.insertedId : stopId;
		if (insertedId) {
			await uploadImage(insertedId);
		}

		// If the Stop is new, redirect to the detail page
		if (insertedId && stopId === 'new') {
			router.replace(Routes.STOP_DETAIL(insertedId));
		}

		useToast.success({
			message: 'Paragem salvo com sucesso',
			title: 'Sucesso',
		});

		setIsSaving(false);
	};

	const deleteStop = async () => {
		if (stopId === 'new') return;

		const response = await fetchData<Stop>(Routes.STOPS_API + Routes.STOP_DETAIL(stopId), 'DELETE', stop);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao salvar paragem',
				});
			}
			return;
		}

		useToast.success({
			message: 'Paragem apagada com sucesso',
			title: 'Sucesso',
		});

		router.replace(Routes.STOP_LIST);
	};

	const deleteImage = async () => {
		if (stopId === 'new') return;

		const response = await fetchData<Stop>(Routes.STOPS_API + Routes.STOP_IMAGE(stopId), 'DELETE', stop);
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
			Routes.STOPS_API + Routes.STOP_IMAGE(stopId),
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

	//
	// E. Define context value
	const contextValue: StopDetailContextState = React.useMemo(() => ({
		actions: {
			// addReference,
			deleteImage,
			deleteStop,
			imageChanged: (image: File) => setImage(image),
			// removeReference,
			// saveStop: (type: 'draft' | 'publish') => saveStop(type),
			saveStop,
		},
		data: {
			_id: stopId === 'new' ? undefined : stopId,
			form,
			// fileUrl: fileUrl?.data,
			// imageUrl: imageUrl?.data,
			// bench_status: stop?.bench_status,
			// comments: stop?.comments,
			// connections: stop?.connections,
			// created_at: stop?.created_at,
			// district_id: stop?.district_id,
			// docking_bay_type: stop?.docking_bay_type,
			// electricity_status: stop?.electricity_status,
			// facilities: stop?.facilities,
			// file_ids: stop?.file_ids,
			// flag_status: stop?.flag_status,
			// image_ids: stop?.image_ids,
			// // imageUrl: string | undefined
			// is_archived: stop?.is_archived,
			// is_locked: stop?.is_locked,
			// jurisdiction: stop?.jurisdiction,
			// last_infrastructure_check: stop?.last_infrastructure_check,
			// last_infrastructure_maintenance: stop?.last_infrastructure_maintenance,
			// last_schedules_check: stop?.last_schedules_check,
			// last_schedules_maintenance: stop?.last_schedules_maintenance,
			// latitude: stop?.latitude,
			// lighting_status: stop?.lighting_status,
			// locality_id: stop?.locality_id,
			// longitude: stop?.longitude,
			// municipality_id: stop?.municipality_id,
			// name: stop?.name,
			// new_name: stop?.new_name,
			// observations: stop?.observations,
			// operational_status: stop?.operational_status,
			// parish_id: stop?.parish_id,
			// pavement_type: stop?.pavement_type,
			// pole_status: stop?.pole_status,
			// road_type: stop?.road_type,
			// shelter_code: stop?.shelter_code,
			// shelter_maintainer: stop?.shelter_maintainer,
			// shelter_make: stop?.shelter_make,
			// shelter_model: stop?.shelter_model,
			// shelter_status: stop?.shelter_status,
			// short_name: stop?.short_name,
			// sidewalk_type: stop?.sidewalk_type,
			// tts_name: stop?.tts_name,
			// updated_at: stop?.updated_at,
		},
		flags: {
			canSave,
			isReadOnly,
			isSaving,
			loading: isLoading || loading || imageUrlLoading,
			mode: stopId === 'new' ? StopDetailMode.CREATE : StopDetailMode.EDIT,
		},
	}), [stopId, form, stop, isLoading, loading, imageUrlLoading, isSaving, canSave, isReadOnly, image]);

	//
	// F. Render components
	return (
		<StopDetailContext.Provider value={contextValue}>
			{children}
		</StopDetailContext.Provider>
	);
};
