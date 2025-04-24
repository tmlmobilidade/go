'use client';

/* * */

import { Routes } from '@/lib/routes';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { CreateValidationDto, CreateValidationSchema, Validation, ValidationSchema } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
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
		setOperationValidationFile: (file: File) => void
		setReferenceValidationFile: (file: File) => void
		toggleLock: () => void
	}
	data: {
		agencies: { label: string, value: string }[]
		form: UseFormReturnType<CreateValidationDto>
		id: string | undefined
	}
	flags: {
		canSave: boolean
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: ValidationDetailMode
	}
}

const emptyValidation: CreateValidationDto = {
	agency_id: undefined,
	feeder_status: 'waiting',
	is_locked: false,
	valid_from: undefined,
	valid_until: undefined,
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
	const [operationValidationFile, setOperationValidationFile] = useState<File | null>(null);
	const [referenceValidationFile, setReferenceValidationFile] = useState<File | null>(null);

	const { data: validation, error, isLoading } = useSWR<Validation>(validationId === 'new' ? null : Routes.API(Routes.PLAN_DETAIL(validationId)), swrFetcher);
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
			title: 'Erro ao carregar validationo',
		});

		router.replace(Routes.PLAN_LIST);
	}, [error]);

	// Validate form on change
	useEffect(() => {
		form.validate();
		console.log('canSave', form.isValid());
		setCanSave(form.isValid());

		console.log(form.errors);
	}, [form.values]);

	const availableAgencies = useMemo(() => {
		return AVAILABLE_AGENCIES.map(agency => ({
			label: agency.name,
			value: agency._id,
		}));
	}, []);

	//
	// D. Define actions
	const toggleLock = () => {
		form.setFieldValue('is_locked', !form.getValues().is_locked);
	};

	const createValidation = async () => {
		setIsSaving(true);
		const uploadFormData = new FormData();

		uploadFormData.append('agency_id', form.getValues().agency_id);
		uploadFormData.append('feeder_status', form.getValues().feeder_status);
		uploadFormData.append('is_locked', form.getValues().is_locked.toString());
		uploadFormData.append('valid_from', form.getValues().valid_from);
		uploadFormData.append('valid_until', form.getValues().valid_until);
		uploadFormData.append('operation_validation', operationValidationFile);

		const response = await multipartFetch(Routes.API(Routes.PLAN_LIST), uploadFormData);

		if (response.error) {
			useToast.error({
				message: response.error,
				title: 'Erro ao criar validationo',
			});
			return;
		}

		const { data: { insertedId } } = response.data as { data: { insertedId: string } };

		if (insertedId) {
			router.push(Routes.PLAN_DETAIL(insertedId));
		}

		useToast.success({
			message: 'Validationo criado com sucesso',
			title: 'Sucesso',
		});

		setIsSaving(false);
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
				setOperationValidationFile,
				setReferenceValidationFile,
				toggleLock,
			},
			data: {
				agencies: availableAgencies,
				form,
				id: validationId === ValidationDetailMode.NEW ? undefined : validationId,
			},
			flags: {
				canSave,
				isReadOnly: false,
				isSaving,
				loading: isLoading,
				mode: validationId === ValidationDetailMode.NEW ? ValidationDetailMode.NEW : ValidationDetailMode.EDIT,
			},
		};
	}, [availableAgencies, form, isLoading, isSaving, validationId, canSave]);

	// F. Render Components
	return (
		<ValidationDetailContext.Provider value={contextValue}>
			{children}
		</ValidationDetailContext.Provider>
	);
};
