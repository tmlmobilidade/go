'use client';

import { Routes } from '@/lib/routes';
import { type CreateStopDto, type Stop, UpdateStopDto, UpdateStopSchema } from '@tmlmobilidade/types';
import { useForm, type UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { convertObject, fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

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
	latitude: Number(),
	legacy_id: '',
	locality_id: '',
	longitude: Number(),
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

interface StopDetailContextState {
	actions: {
		deleteImage: () => void
		deleteStop: () => void
		// fileChanged: (file: File) => void
		saveStop: () => void
	}
	data: {
		form: UseFormReturnType<CreateStopDto | UpdateStopDto>
		// imageUrl: string | undefined
		stop: Stop | undefined
	}
	flags: {
		can_save: boolean
		error: Error | undefined
		loading: boolean
		read_only: boolean
		saving: boolean
	}
}

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

export const StopDetailContextProvider = ({ children, stopId }: PropsWithChildren<{ stopId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);
	const [canSave, setCanSave] = useState(false);
	// const [image, setImage] = useState<File | null>(null);

	//
	// B. Fetch data

	const { mutate: allStopsMutate } = useSWR<Stop[]>('/api/stops');
	const { data: stopData, error: stopError, isLoading: stopLoading, mutate: stopMutate } = useSWR<Stop>(`/api/stops/${stopId}`, { refreshInterval: 5000 });

	// const { data: imageUrl, isLoading: imageUrlLoading } = useSWR<undefined | { data: string, message: string }>(
	// 	stopId === 'new'
	// 		? undefined
	// 		: Routes.API + Routes.STOPS_DETAIL(stopId),
	// );

	//
	// C. Setup form

	const form = useForm<CreateStopDto>({
		initialValues: stopData || emptyStop,
		// validate: zodResolver(stop ? StopSchema : CreateStopSchema) as unknown as FormValidateInput<CreateStopDto>,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// D. Transform data

	//
	// E. Handle actions

	useEffect(() => {
		if (!stopData) return;
		form.reset();
		form.setValues(stopData);
		form.resetDirty();
	}, [stopData]);

	// Validate form on change

	useEffect(() => {
		form.validate();
		setCanSave(form.isValid());
	}, [form.values]);

	//
	// B. Handle actions

	const handleSaveStop = async () => {
		setIsSaving(true);
		const method = stopId ? 'PUT' : 'POST';
		const url = !stopId ? Routes.STOP_API(Routes.STOPS_LIST) : Routes.STOP_API(`/stops/${stopId}`);
		const body = !stopId ? form.values : convertObject(form.values, UpdateStopSchema);
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
			setIsSaving(false);
			return;
		}

		useToast.success({
			message: 'Paragem salva com sucesso',
			title: 'Sucesso',
		});

		if (stopId && response.data?._id) {
			router.replace(Routes.STOPS_DETAIL(response.data._id));
		}

		setIsSaving(false);
		stopMutate();
		allStopsMutate();
		setIsSaving(false);
		return;
	};

	//

	const handleDeleterStop = async () => {
		const response = await fetchData<Stop>(`/api/stops/${stopId}`, 'DELETE');
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
		useToast.success({ message: 'Paragem arquivada com sucesso.', title: 'Sucesso' });
		router.push('/stops', { scroll: false });
	};

	//

	const deleteImage = async () => {
		// const response = await fetchData<Stop>(Routes.API + Routes.STOPS_DETAIL(stopId), 'DELETE', alert);
		// if (response.error) {
		// 	const errors = JSON.parse(response.error);
		// 	for (const error of errors) {
		// 		useToast.error({
		// 			message: error.message,
		// 			title: 'Erro ao apagar imagem',
		// 		});
		// 	}
		// 	return;
		// }
		useToast.success({
			message: 'Imagem apagada com sucesso',
			title: 'Sucesso',
		});
	};

	//

	// const uploadImage = async (stopId: string) => {
	// if (stopId === 'new' || !image) return;

	// const response = await uploadFile(
	// 	Routes.API + Routes.STOPS_DETAIL(stopId),
	// 	image,
	// );

	// if (response.error) {
	// 	useToast.error({
	// 		message: response.error,
	// 		title: 'Erro ao carregar imagem',
	// 	});
	// 	return;
	// }

	// useToast.success({
	// 	message: 'A imagem foi carregada com sucesso',
	// 	title: 'Imagem carregada com sucesso',
	// });
	// };

	//
	// F. Define context value

	const contextValue: StopDetailContextState = useMemo(() => ({
		actions: {
			deleteImage,
			deleteStop: handleDeleterStop,
			// fileChanged: (file: File) => setImage(file),
			saveStop: handleSaveStop,
		},
		data: {
			form,
			id: stopId,
			// imageUrl: imageUrl?.data,
			stop: stopData,
		},
		flags: {
			can_save: canSave,
			error: stopError,
			loading: stopLoading,
			read_only: isReadOnly,
			saving: isSaving,
		},
	}), [
		stopData,
		stopLoading,
		stopError,
		form,
		canSave,
		isReadOnly,
		isSaving,
		stopId,
	]);

	//
	// G. Render components

	return (
		<StopDetailContext.Provider value={contextValue}>
			{children}
		</StopDetailContext.Provider>
	);

	//
};
