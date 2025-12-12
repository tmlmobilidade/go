'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateStopDto, type Stop, UpdateStopDto, UpdateStopSchema } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface StopDetailContextState {
	actions: {
		archive: () => void
		deleteImage: () => void
		lock: () => void
		// fileChanged: (file: File) => void
		save: () => void
	}
	data: {
		form: UseFormReturnType<CreateStopDto | UpdateStopDto>
		// imageUrl: string | undefined
		stop: Stop | undefined
	}
	flags: {
		error: Error | undefined
		isSaving: boolean
		loading: boolean
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

	//
	// B. Fetch data

	const { mutate: allStopsMutate } = useSWR<Stop[]>(API_ROUTES.stops.STOPS_LIST);
	const { data: stopData, error: stopError, isLoading: stopLoading, mutate: stopMutate } = useSWR<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId));

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateStopDto>(UpdateStopSchema, stopData);

	//
	// B. Handle actions

	const handleSaveStop = async () => {
		setIsSaving(true);
		const response = await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId), 'POST', form.getValues());
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
		setIsSaving(false);
		stopMutate();
		allStopsMutate();
		setIsSaving(false);
	};

	const handleArchiveStop = async () => {
		const response = await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL_ARCHIVE(stopId));
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao apagar paragem' });
			}
			return;
		}
		useToast.success({ message: 'Paragem arquivada com sucesso.', title: 'Sucesso' });
		stopMutate();
		allStopsMutate();
		// router.push(keepUrlParams(PAGE_ROUTES.stops.STOPS_LIST), { scroll: false });
	};

	const handleLockStop = async () => {
		const response = await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL_LOCK(stopId));
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao bloquear paragem' });
			}
			return;
		}
		useToast.success({ message: 'Paragem bloqueada com sucesso.', title: 'Sucesso' });
		stopMutate();
		allStopsMutate();
	};

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
			archive: handleArchiveStop,
			deleteImage,
			lock: handleLockStop,
			// fileChanged: (file: File) => setImage(file),
			save: handleSaveStop,
		},
		data: {
			form,
			id: stopId,
			// imageUrl: imageUrl?.data,
			stop: stopData,
		},
		flags: {
			error: stopError,
			isSaving,
			loading: stopLoading,
		},
	}), [
		stopData,
		stopLoading,
		stopError,
		form,
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
