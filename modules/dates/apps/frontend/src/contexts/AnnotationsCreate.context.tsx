/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation, type CreateAnnotationDto, CreateAnnotationSchema } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { mutate } from 'swr';

/* * */

interface AnnotationsCreateContextState {
	actions: {
		createAnnotation: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateAnnotationDto>
	}
	flags: {
		loading: boolean
	}
}

/* * */

const AnnotationsCreateContext = createContext<AnnotationsCreateContextState | undefined>(undefined);

export function useAnnotationsCreateContext() {
	const context = useContext(AnnotationsCreateContext);
	if (!context) {
		throw new Error('useAnnotationsCreateContext must be used within a AnnotationsCreateContextProvider');
	}
	return context;
}

/* * */

export const AnnotationsCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const [isLoading, setIsLoading] = useState(false);

	//
	// B. Setup form

	const form = useForm<CreateAnnotationDto>({
		initialValues: {
			agency_ids: [],
			dates: [],
			description: '',
			is_locked: false,
			title: '',
		},
		validate: zodResolver(CreateAnnotationSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Handle actions

	const createAnnotation = async () => {
		setIsLoading(true);

		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A criar anotação',
		});

		try {
			const response = await fetchData<Annotation>(API_ROUTES.dates.ANNOTATIONS_LIST, 'POST', form.getValues());

			if (response.error) {
				useToast.update(toastId, {
					loading: false,
					message: response.error,
					title: 'Erro ao criar anotação',
					type: 'error',
				});
				setIsLoading(false);
				return;
			}

			useToast.update(toastId, {
				loading: false,
				message: 'Anotação criada com sucesso',
				title: 'Sucesso',
				type: 'success',
			});

			mutate(API_ROUTES.dates.ANNOTATIONS_LIST);

			setIsLoading(false);

			if (response.data) {
				window.location.href = PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(response.data._id);
			}
		}
		catch (error) {
			useToast.update(toastId, {
				loading: false,
				message: error.message,
				title: 'Erro ao criar anotação',
				type: 'error',
			});
			setIsLoading(false);
		}
	};

	//
	// D. Define context value

	const contextValue: AnnotationsCreateContextState = useMemo(() => {
		return {
			actions: {
				createAnnotation,
			},
			data: {
				form,
			},
			flags: {
				loading: isLoading,
			},
		};
	}, [form, isLoading]);

	//
	// E. Render components

	return (
		<AnnotationsCreateContext.Provider value={contextValue}>
			{children}
		</AnnotationsCreateContext.Provider>
	);

	//
};
