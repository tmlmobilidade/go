'use client';

import { fetchData, swrFetcher } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { CreateStopDto, CreateStopSchema, Stop, StopSchema, UpdateStopSchema } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { convertObject, multipartFetch } from '@tmlmobilidade/utils';
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
		deleteFile: (fileId: string) => void
		deleteImage: (imageId: string) => void
		// addReference: () => void
		deleteStop: () => void
		getFiles: (stopId: string) => void
		getImages: (stopId: string) => void
		handleCommentsChange: (userId: string, text: string) => void
		handleConnectionsChange: (connections: string) => void
		handleFacilitiesChange: (facilities: string) => void
		handleFileChange: (file: File) => void
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
	affectation: [],
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
	const context = useContext(StopsDetailContext);
	if (!context) {
		throw new Error('useStopsDetailContext must be used within a StopsDetailContextProvider');
	}
	return context;
}

export const StopsDetailContextProvider = ({ children, stopId }: { children: React.ReactNode, stopId: string }) => {
	//

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
		if (!dataActiveStopIdState || !stopsContext.data.stops || !stopsContext.data.stops.length) return;
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
		setDataActiveStopIdState(stopId);
	};

	const saveStop = async () => {
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
		// if (insertedId) {
		// 	await uploadImage(insertedId);
		// }

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

		form.setFieldValue('is_archived', true);
		const stop_delete = convertObject(form.getValues(), UpdateStopSchema);
		const response = await fetchData<Stop>(Routes.STOPS_API + Routes.STOP_DETAIL(stopId), 'PUT', stop_delete);
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

	const getImages = async () => {
		if (!stopId || stopId === 'new') {
			console.error('Invalid stopId provided');
			return;
		}

		try {
			const response = await fetch(`${Routes.STOPS_API}${Routes.STOP_IMAGES(stopId)}`, {
				method: 'GET',
			});

			if (!response.ok) {
				const errorData = await response.json();
				useToast.error({
					message: errorData.message || 'Erro ao carregar imagens',
					title: 'Erro',
				});
				return;
			}

			const { data: imageUrls } = await response.json();

			// useToast.success({
			// 	message: 'Imagens carregadas com sucesso',
			// 	title: 'Sucesso',
			// });

			return imageUrls;
		}
		catch (error) {
			console.error('Error fetching images:', error);
			useToast.error({
				message: 'Erro ao carregar imagens',
				title: 'Erro',
			});
		}
	};

	const getFiles = async () => {
		if (!stopId || stopId === 'new') {
			console.error('Invalid stopId provided');
			return;
		}

		try {
			const response = await fetch(`${Routes.STOPS_API}${Routes.STOP_FILES(stopId)}`, {
				method: 'GET',
			});

			if (!response.ok) {
				const errorData = await response.json();
				useToast.error({
					message: errorData.message || 'Erro ao carregar ficheiros',
					title: 'Erro',
				});
				return;
			}

			const { data: fileUrls } = await response.json();

			// useToast.success({
			// 	message: 'Ficheiros carregadas com sucesso',
			// 	title: 'Sucesso',
			// });

			return fileUrls;
		}
		catch (error) {
			console.error('Error fetching ficheiros:', error);
			useToast.error({
				message: 'Erro ao carregar ficheiros',
				title: 'Erro',
			});
		}
	};

	const handleImageChange = (file: File) => {
		setImage(file);
	};

	useEffect(() => {
		if (!image) return;
		uploadImage(stopId);
	}, [image]);

	const handleFileChange = (file: File) => {
		setFile(file);
	};

	useEffect(() => {
		if (!file) return;
		uploadFile(stopId);
	}, [file]);

	const deleteImage = async (imageId: string) => {
		if (stopId === 'new') return;

		const response = await fetchData<Stop>(`${Routes.STOPS_API}${Routes.STOP_IMAGE(stopId)}/${imageId}`, 'DELETE', stop);

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
	}
	;
	const deleteFile = async (fileId: string) => {
		if (stopId === 'new') return;

		const response = await fetchData<Stop>(`${Routes.STOPS_API}${Routes.STOP_FILE(stopId)}/${fileId}`, 'DELETE', stop);

		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao apagar ficheiro',
				});
			}
			return;
		}

		useToast.success({
			message: 'Ficheiro apagado com sucesso',
			title: 'Sucesso',
		});
	};

	const uploadImage = async (stopId: string) => {
		if (stopId === 'new' || !image) return;

		setIsSaving(true);

		const uploadFormData = new FormData();

		uploadFormData.append('File', image);

		const response = await multipartFetch(`${Routes.STOPS_API}${Routes.STOP_IMAGE(stopId)}`, uploadFormData);

		if (response.error) {
			useToast.error({
				message: response.error,
				title: 'Erro ao carregar imagem',
			});
			return;
		}

		// const { data: { insertedId } } = response.data as { data: { insertedId: string } };

		// if (insertedId) {
		// 	router.push(Routes.STOP_IMAGE(insertedId));
		// }

		useToast.success({
			message: 'Imagem carregada com sucesso',
			title: 'Sucesso',
		});

		setIsSaving(false);
	}
	;
	const uploadFile = async (stopId: string) => {
		if (stopId === 'new' || !file) return;

		setIsSaving(true);

		const uploadFormData = new FormData();

		uploadFormData.append('File', file);

		const response = await multipartFetch(`${Routes.STOPS_API}${Routes.STOP_FILE(stopId)}`, uploadFormData);

		console.log('-> ==> response', response);

		if (response.error) {
			useToast.error({
				message: response.error,
				title: 'Erro ao carregar file',
			});
			return;
		}

		// const { data: { insertedId } } = response.data as { data: { insertedId: string } };

		// if (insertedId) {
		// 	router.push(Routes.STOP_IMAGE(insertedId));
		// }

		useToast.success({
			message: 'Ficheiro carregado com sucesso',
			title: 'Sucesso',
		});

		setIsSaving(false);
	};

	const handleConnectionsChange = (connections: 'airport' | 'bike_parking' | 'bike_sharing' | 'boat' | 'car_parking' | 'ferry' | 'light_rail' | 'subway' | 'train') => {
		// console.log('-> handleConnectionsChange');
		const newConnections = form.values.connections.includes(connections) ? form.values.connections.filter(c => c !== connections) : [...form.values.connections, connections];
		form.setFieldValue('connections', newConnections);
	};

	const handleFacilitiesChange = (facilities: 'fire_station' | 'health_clinic' | 'historic_building' | 'hospital' | 'pip' | 'police_station' | 'school' | 'shopping' | 'transit_office' | 'university') => {
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
			// @ts-expect-error: Random _id should exist
			_id: generateRandomId(),
			text: text,
			user_id: userId,
		});
		form.setFieldValue('comments', form.values.comments);
	};

	//
	// E. Define context value
	const contextValue: StopsDetailContextState = useMemo(() => {
		return {
			actions: {
				// addReference,
				deleteFile,
				deleteImage,
				deleteStop,
				getFiles,
				getImages,
				handleFileChange,
				handleImageChange,
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
	}, [deleteImage, deleteStop, handleCommentsChange, handleImageChange, getImages, deleteImage, handleFileChange, getFiles, deleteFile, handleConnectionsChange, handleFacilitiesChange, saveStop, setActiveStopId, stopId, dataActiveStopIdState, form, canSave, isReadOnly, isSaving, isLoading, loading]);

	//
	// F. Render components
	return (
		<StopsDetailContext.Provider value={contextValue}>
			{children}
		</StopsDetailContext.Provider>
	);
};
