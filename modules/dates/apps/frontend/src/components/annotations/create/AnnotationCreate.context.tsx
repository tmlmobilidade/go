/* * */

import { closeCreateAnnotationModal } from '@/components/annotations/create/AnnotationCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation, type CreateAnnotationDto, CreateAnnotationSchema } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface AnnotationCreateContextState {
	actions: {
		createAnnotation: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateAnnotationDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const AnnotationCreateContext = createContext<AnnotationCreateContextState | undefined>(undefined);

export function useAnnotationCreateContext() {
	const context = useContext(AnnotationCreateContext);
	if (!context) {
		throw new Error('useAnnotationCreateContext must be used within a AnnotationCreateContextProvider');
	}
	return context;
}

/* * */

export const AnnotationCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Fetch data

	const { mutate: allAnnotationsMutate } = useSWR<Annotation[]>(API_ROUTES.dates.ANNOTATIONS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateAnnotationDto>(CreateAnnotationSchema);

	//
	// D. Handle actions

	const handleCreateAnnotation = async () => {
		setIsSaving(true);
		const response = await fetchData<Annotation>(API_ROUTES.dates.ANNOTATIONS_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao criar anotação' });
				setIsSaving(false);
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao criar anotação' });
			}
			setIsSaving(false);
			return;
		}
		form.reset();
		allAnnotationsMutate();
		setIsSaving(false);
		closeCreateAnnotationModal();
		useToast.success({ message: 'Anotação criada com sucesso', title: 'Sucesso' });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(response.data._id)));
	};

	//
	// E. Define context value

	const contextValue: AnnotationCreateContextState = useMemo(() => {
		return {
			actions: {
				createAnnotation: handleCreateAnnotation,
			},
			data: {
				form,
			},
			flags: {
				isSaving,
			},
		};
	}, [
		form,
		isSaving,
	]);

	//
	// F. Render components

	return (
		<AnnotationCreateContext.Provider value={contextValue}>
			{children}
		</AnnotationCreateContext.Provider>
	);

	//
};
