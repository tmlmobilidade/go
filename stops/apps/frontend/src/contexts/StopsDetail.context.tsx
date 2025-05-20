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
import { convertObject, Dates } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { useStopsContext } from './Stops.context';

export enum StopsDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

interface StopsDetailContextState {
	actions: {
		// addReference: () => void
		deleteImage: () => void
		deleteStop: () => void
		handleCommentsChange: (userId: string, text: string) => void
		handleConnectionsChange: (connections: string) => void
		handleFacilitiesChange: (facilities: string) => void
		handleImageChange: (file: File) => void
		// removeReference: (index: number) => void
		// saveStop: (type: 'draft' | 'publish') => void
		saveStop: () => void
		setActiveStopId: (stopId: string) => void
	}
	data: {
		_id: string | undefined
		active_stop_id: string
		form: UseFormReturnType<CreateStopDto>
	}
	flags: {
		canSave: boolean
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: StopsDetailMode
	}
}

const emptyStop: CreateStopDto = {
	_id: 'temp',
	// affectation: [],
	bench_status: 'unknown',
	comments: [],
	connections: [],
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
	last_infrastructure_check: null,
	last_infrastructure_maintenance: null,
	last_schedules_check: null,
	last_schedules_maintenance: null,
	last_shelter_installation: null,
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
};

const StopsDetailContext = createContext<StopsDetailContextState | undefined>(undefined);

export function useStopsDetailContext() {
	// console.log('-> useStopsDetailContext');
	const context = useContext(StopsDetailContext);
	if (!context) {
		throw new Error('useStopsDetailContext must be used within a StopsDetailContextProvider');
	}
	return context;
}

export const StopsDetailContextProvider = ({ children, stopId }: { children: React.ReactNode, stopId: string }) => {
	// console.log('-> StopsDetailContextProvider');
	//
	// A. Setup variables
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);
	const [canSave, setCanSave] = useState(false);
	const [image, setImage] = useState<File | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [dataActiveStopIdState, setDataActiveStopIdState] = useState<string>(stopId);

	const stopsContext = useStopsContext();

	const { data: stop, error, isLoading } = useSWR<Stop>(stopId === 'new' ? null : Routes.STOPS_API + Routes.STOP_DETAIL(stopId), swrFetcher);

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

	useEffect(() => {
		// console.log('-> UseEffect 1');
		// console.log('-> ==> dataActiveStopIdState', dataActiveStopIdState);
		// console.log('-> ==> stopsContext.data.stops', stopsContext.data.stops);
		if (!dataActiveStopIdState || !stopsContext.data.stops || !stopsContext.data.stops.length) return;
		// console.log('-> HERE');
		const foundStopData = stopsContext.actions.getStopById(dataActiveStopIdState);
		if (foundStopData) {
			window.history.replaceState({}, '', `/stops/${dataActiveStopIdState}` + window.location.search);
		}
	}, [stopsContext.data.stops, dataActiveStopIdState]);

	// Update form
	useEffect(() => {
		// console.log('-> UseEffect 2');
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

	// useEffect(() => {
	// 	console.log('-> UseEffect 2.1', loading);
	// }, [loading]);

	// useEffect(() => {
	// 	console.log('-> UseEffect 2.2', flags);
	// }, [stopsDetailContext.flags]);

	useEffect(() => {
		// console.log('-> UseEffect 3');
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
		// console.log('-> UseEffect 4');
		form.validate();
		setCanSave(form.isValid());

		// console.log(form.errors);
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
	const setActiveStopId = (stopId: string) => {
		// console.log('-> setActiveStopId');
		setDataActiveStopIdState(stopId);
	};

	const saveStop = async () => {
		// console.log('-> saveStop');
		setIsSaving(true);

		// Handle Save Stop
		// const active_period_end_date = form.getValues().active_period_end_date ?? null;
		// const publish_end_date = form.getValues().publish_end_date ?? null;

		// const saveStop: CreateStopDto = { ...form.values, active_period_end_date, publish_end_date, publish_status: type === 'publish' ? 'PUBLISHED' : 'DRAFT' };
		// const saveStop: CreateStopDto = { ...form.values, active_period_end_date, publish_end_date };
		const saveStop: CreateStopDto = { ...form.values };
		// console.log('-> ==> saveStop', saveStop);
		const method = stopId === 'new' ? 'POST' : 'PUT';
		const url = stopId === 'new' ? Routes.STOPS_API + Routes.STOP_LIST : Routes.STOPS_API + Routes.STOP_DETAIL(stopId);
		let body = stopId === 'new' ? saveStop : convertObject(saveStop, UpdateStopSchema);

		// body = { ...body, active_period_end_date, publish_end_date };
		body = { ...body };
		// console.log('-> ==> body', body);
		const response = await fetchData<unknown>(url, method, body);
		// console.log('-> ==> response', response);
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
		// console.log('-> deleteStop');
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
		// console.log('-> deleteImage');
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
		// console.log('-> uploadImage');
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

	const handleConnectionsChange = (connections: string) => {
		// console.log('-> handleConnectionsChange');
		const newConnections = form.values.connections.includes(connections) ? form.values.connections.filter(c => c !== connections) : [...form.values.connections, connections];
		form.setFieldValue('connections', newConnections);
	};

	const handleFacilitiesChange = (facilities: string) => {
		// console.log('-> handleFacilitiesChange');
		const newFacilities = form.values.facilities.includes(facilities) ? form.values.facilities.filter(c => c !== facilities) : [...form.values.facilities, facilities];
		form.setFieldValue('facilities', newFacilities);
	};

	const generateRandomId = (length = 6): string => {
		// console.log('-> generateRandomId');
		return Math.random().toString(36).substr(2, length);
	};

	const handleCommentsChange = (userId: string, text: string) => {
		// console.log('-> handleCommentsChange');
		form.values.comments.push({
			_id: generateRandomId(),
			text: text,
			user_id: userId });
		form.setFieldValue('comments', form.values.comments);
	};

	//
	// E. Define context value
	const contextValue: StopsDetailContextState = useMemo(() => {
		return {
			actions: {
				// addReference,
				deleteImage,
				deleteStop,
				handleImageChange: (image: File) => setImage(image),
				// removeReference,
				// saveStop: (type: 'draft' | 'publish') => saveStop(type),
				handleCommentsChange,
				handleConnectionsChange,
				handleFacilitiesChange,
				saveStop,
				setActiveStopId,
			},
			data: {
				_id: stopId === 'new' ? undefined : stopId,
				active_stop_id: dataActiveStopIdState,
				form,
			},
			flags: {
				canSave,
				isReadOnly,
				isSaving,
				loading: isLoading || loading,
				// loading: isLoading || loading || imageUrlLoading,
				mode: stopId === 'new' ? StopsDetailMode.CREATE : StopsDetailMode.EDIT,
			},
		};
	}, [deleteImage, deleteStop, handleCommentsChange, handleConnectionsChange, handleFacilitiesChange, saveStop, setActiveStopId, stopId, dataActiveStopIdState, form, canSave, isReadOnly, isSaving, isLoading, loading]);

	//
	// F. Render components
	return (
		<StopsDetailContext.Provider value={contextValue}>
			{children}
		</StopsDetailContext.Provider>
	);
};
