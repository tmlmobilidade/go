'use client';

/* * */

import { CREATE_VALIDATION_MODAL_ID } from '@/components/validations/detail/CreateValidationModal';
import { Routes } from '@/lib/routes';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { CreateValidationDto, CreateValidationSchema, File as TmlFile, Validation, ValidationSchema } from '@tmlmobilidade/types';
import { closeModal, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { multipartFetch, swrFetcher } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export enum ValidationDetailMode {
	EDIT = 'edit',
	NEW = 'new',
}

interface ValidationDetailContextState {
	actions: {
		saveValidation: () => void
		setValidationFile: (file: File) => void
	}
	data: {
		agencies: { label: string, value: string }[]
		file: null | TmlFile
		form: UseFormReturnType<CreateValidationDto>
		id: string | undefined
	}
	flags: {
		canSave: boolean
		error: Error | null
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: ValidationDetailMode
	}
}

const emptyValidation: CreateValidationDto = {
	agency_id: undefined,
	feeder_status: 'waiting',
};
const ValidationDetailContext = createContext<undefined | ValidationDetailContextState>(undefined);

export function useValidationDetailContext() {
	const context = useContext(ValidationDetailContext);
	if (!context) {
		throw new Error('useValidationDetailContext must be used within a ValidationDetailContextProvider');
	}

	return context;
}

export const ValidationDetailContextProvider = ({ children, validationId }: { children: React.ReactNode, validationId: string }) => {
	//
	// A. State Management
	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);
	const [canSave, setCanSave] = useState(false);
	const [validationFile, setValidationFile] = useState<File | null>(null);

	const { data: validation, error, isLoading } = useSWR<Validation>(validationId === 'new' ? null : Routes.API(Routes.VALIDATION_DETAIL(validationId)), swrFetcher);
	const { data: file, error: fileError, isLoading: fileLoading } = useSWR<TmlFile>(validationId === 'new' ? null : Routes.API(Routes.VALIDATION_DETAIL(validationId)) + '/file', swrFetcher);
	// const { data: agencies, error: agenciesError, isLoading: agenciesLoading } = useSWR<Agency[]>(Routes.API(Routes.AGENCIES), swrFetcher);

	//
	// B. Define form
	const form = useForm<CreateValidationDto>({
		initialValues: validationId === ValidationDetailMode.NEW ? emptyValidation : validation,
		validate: zodResolver(validationId === ValidationDetailMode.NEW ? CreateValidationSchema : ValidationSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Transform Data
	useEffect(() => {
		if (!validation) return;

		form.reset();
		form.setValues(validation);
		form.resetDirty();
	}, [validation]);

	useEffect(() => {
		if (!error) return;

		useToast.error({
			message: error.message,
			title: 'Erro ao carregar validação',
		});

		router.replace(Routes.VALIDATION_LIST);
	}, [error]);

	// Validate form on change
	useEffect(() => {
		form.validate();
	}, [form.values]);

	// Set canSave
	useEffect(() => {
		setCanSave(form.isValid() && !!validationFile);
	}, [form.isValid, validationFile]);

	const availableAgencies = useMemo(() => {
		return AVAILABLE_AGENCIES.map(agency => ({
			label: agency.name,
			value: agency._id,
		}));
	}, []);

	//
	// D. Define actions
	const createValidation = async () => {
		setIsSaving(true);
		const uploadFormData = new FormData();

		uploadFormData.append('operation_validation', validationFile);
		Object.entries(form.getValues()).forEach(([key, value]) => {
			if (!value) return;
			uploadFormData.append(key, String(value));
		});

		const response = await multipartFetch(Routes.API(Routes.VALIDATION_LIST), uploadFormData);

		if (response.error) {
			useToast.error({
				message: response.error,
				title: 'Erro ao criar validação',
			});
			return;
		}

		const { data: { insertedId } } = response.data as { data: { insertedId: string } };

		if (insertedId) {
			router.push(Routes.VALIDATION_DETAIL(insertedId));
		}

		useToast.success({
			message: 'Validação criado com sucesso',
			title: 'Sucesso',
		});

		setIsSaving(false);
		closeModal(CREATE_VALIDATION_MODAL_ID);
	};

	const updateValidation = () => {
		const formData = form.values;
		console.log('updateValidation', formData);
	};

	const saveValidation = () => {
		if (validationId === ValidationDetailMode.NEW) {
			createValidation();
		}
		else {
			updateValidation();
		}
	};

	//
	// E. Define context value
	const contextValue: ValidationDetailContextState = useMemo(() => {
		return {
			actions: {
				saveValidation,
				setValidationFile,
			},
			data: {
				agencies: availableAgencies,
				file,
				form,
				id: validationId === ValidationDetailMode.NEW ? undefined : validationId,
			},
			flags: {
				canSave,
				error: fileError || error,
				isReadOnly: false,
				isSaving,
				loading: isLoading || fileLoading,
				mode: validationId === ValidationDetailMode.NEW ? ValidationDetailMode.NEW : ValidationDetailMode.EDIT,
			},
		};
	}, [availableAgencies, form, isLoading, isSaving, validationId, canSave, file, fileError, error]);

	// F. Render Components
	return (
		<ValidationDetailContext.Provider value={contextValue}>
			{children}
		</ValidationDetailContext.Provider>
	);
};
