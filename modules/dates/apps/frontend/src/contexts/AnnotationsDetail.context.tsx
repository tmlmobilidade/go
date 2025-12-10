'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation, type UpdateAnnotationDto } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface AnnotationsDetailContextState {
	actions: {
		deleteAnnotation: () => void
		saveAnnotation: () => void
		toggleLock: () => void
	}
	data: {
		annotation: Annotation | null
		form: UseFormReturnType<UpdateAnnotationDto>
		id: string
	}
	flags: {
		error: Error | null
		loading: boolean
		read_only: boolean
		saving: boolean
	}
}

/* * */

const AnnotationsDetailContext = createContext<AnnotationsDetailContextState | undefined>(undefined);

export function useAnnotationsDetailContext() {
	const context = useContext(AnnotationsDetailContext);
	if (!context) {
		throw new Error('useAnnotationsDetailContext must be used within a AnnotationsDetailContextProvider');
	}
	return context;
}

/* * */

export const AnnotationsDetailContextProvider = ({ annotationId, children }: PropsWithChildren<{ annotationId: string }>) => {
	//

	//
	// A. Setup variables

	const [isSaving, setIsSaving] = useState(false);
	const router = useRouter();

	//
	// B. Fetch data

	const { mutate: annotationsListMutate } = useSWR<Annotation[]>(API_ROUTES.dates.ANNOTATIONS_LIST);
	const { data: annotationData, error: annotationError, isLoading: annotationLoading, mutate: annotationMutate } = useSWR<Annotation>(API_ROUTES.dates.ANNOTATIONS_DETAIL(annotationId), { refreshInterval: 5000 });

	//
	// C. Setup form

	const form = useForm<UpdateAnnotationDto>({
		initialValues: {
			agency_ids: [],
			dates: [],
			description: '',
			title: '',
			updated_by: '',
		},
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// D. Transform data

	useEffect(() => {
		if (!annotationData) return;
		form.initialize({
			agency_ids: annotationData.agency_ids,
			dates: annotationData.dates,
			description: annotationData.description,
			title: annotationData.title,
			updated_by: annotationData.updated_by,
		});
	}, [annotationData]);

	useEffect(() => {
		if (!annotationError) return;
		useToast.error({ message: annotationError.message, title: 'Erro ao abrir ocorrência' });
	}, [annotationLoading]);

	//
	// E. Handle actions

	const handleSaveAnnotation = async () => {
		setIsSaving(true);
		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A guardar ocorrência',
		});
		try {
			const response = await fetchData<Annotation>(API_ROUTES.dates.ANNOTATIONS_DETAIL(annotationId), 'PUT', form.getValues());
			if (response.error) {
				return useToast.update(toastId, {
					loading: false,
					message: response.error,
					title: 'Erro ao guardar alterações',
					type: 'error',
				});
			}
			useToast.update(toastId, {
				loading: false,
				message: 'As alterações foram guardadas.',
				title: 'Ocorrência guardada com sucesso',
				type: 'success',
			});
			form.resetDirty();
		}
		catch (error) {
			useToast.update(toastId, {
				loading: false,
				message: error.message,
				title: 'Erro ao guardar alterações',
				type: 'error',
			});
		}
		finally {
			annotationMutate();
			annotationsListMutate();
			setIsSaving(false);
		}
	};

	const handleDeleteAnnotation = async () => {
		try {
			const response = await fetchData<Annotation>(API_ROUTES.dates.ANNOTATIONS_DETAIL(annotationId), 'DELETE', annotationData);
			if (response.error) {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({ message: error.message, title: 'Erro ao apagar ocorrência' });
				}
				return;
			}

			useToast.success({ message: 'Ocorrência apagada com sucesso', title: 'Sucesso' });

			router.replace(PAGE_ROUTES.dates.ANNOTATIONS_LIST);
		}
		catch (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao apagar ocorrência',
			});
		}
		finally {
			annotationsListMutate();
		}
	};

	const handleToggleLock = async () => {
		try {
			const response = await fetchData<Annotation>(API_ROUTES.dates.ANNOTATIONS_DETAIL_TOGGLE_LOCK(annotationId));
			if (response.error) {
				return useToast.error({
					message: response.error,
					title: 'Erro ao bloquear ocorrência',
				});
			}
		}
		catch (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao bloquear ocorrência',
			});
		}
		finally {
			annotationMutate();
			annotationsListMutate();
		}
	};

	//
	// F. Define context value

	const contextValue: AnnotationsDetailContextState = useMemo(() => ({
		actions: {
			deleteAnnotation: handleDeleteAnnotation,
			saveAnnotation: handleSaveAnnotation,
			toggleLock: handleToggleLock,
		},
		data: {
			annotation: annotationData,
			form,
			id: annotationId,
		},
		flags: {
			error: annotationError,
			loading: annotationLoading,
			read_only: annotationData?.is_locked || annotationLoading || isSaving,
			saving: isSaving,
		},
	}), [
		annotationData,
		annotationError,
		annotationLoading,
		annotationId,
		form,
		isSaving,
	]);

	//
	// G. Render components

	return (
		<AnnotationsDetailContext.Provider value={contextValue}>
			{children}
		</AnnotationsDetailContext.Provider>
	);

	//
};
