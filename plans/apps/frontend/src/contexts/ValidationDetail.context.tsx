'use client';

/* * */

import { CREATE_VALIDATION_MODAL_ID } from '@/components/validations/detail/CreateValidationModal';
import { Routes } from '@/lib/routes';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { CreateValidationDto, CreateValidationSchema, GtfsAgency, GtfsFeedInfo, File as TmlFile, Validation, ValidationSchema } from '@tmlmobilidade/types';
import { closeModal, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { multipartFetch, swrFetcher } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

/* * */

export enum ValidationDetailMode {
	EDIT = 'edit',
	NEW = 'new',
}

interface ValidationDetailContextState {
	actions: {
		saveValidation: () => void
		setValidationFile: (file: File | null) => void
	}
	data: {
		agencies: { label: string, value: string }[]
		file: null | TmlFile
		form: UseFormReturnType<CreateValidationDto>
		id: string | undefined
		validation: null | Validation
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
	feeder_status: 'waiting',
	file_id: null,
	gtfs_agency: undefined,
	gtfs_feed_info: undefined,
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
	const workerRef = useRef<null | Worker>(null);

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
		validate: zodResolver((validationId === ValidationDetailMode.NEW ? CreateValidationSchema : ValidationSchema)) as unknown,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Transform Data
	useEffect(() => {
		if (!validation) return;

		form.reset();
		form.initialize(validation);
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
		if (!validationFile) {
			setCanSave(false);
			form.setValues({
				gtfs_agency: undefined,
				gtfs_feed_info: undefined,
			});
			return;
		}

		if (workerRef.current) {
			workerRef.current.terminate();
		}

		workerRef.current = new Worker(new URL('@/workers/gtfs-info.worker.ts', import.meta.url));
		workerRef.current.postMessage({ file: validationFile });

		workerRef.current.onmessage = (event) => {
			if (event.data.error) {
				useToast.error({
					message: event.data.error.message,
					title: 'Erro ao carregar validação',
				});
				return;
			}

			const { agency, feedInfo } = event.data as { agency: GtfsAgency, feedInfo: GtfsFeedInfo };

			form.setValues({
				gtfs_agency: agency,
				gtfs_feed_info: feedInfo,
			});

			setCanSave(true);
		};
	}, [validationFile]);

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

		uploadFormData.append('gtfs_agency', JSON.stringify(form.values.gtfs_agency));
		uploadFormData.append('gtfs_feed_info', JSON.stringify(form.values.gtfs_feed_info));
		uploadFormData.append('feeder_status', form.values.feeder_status);
		uploadFormData.append('file', validationFile);

		const response = await multipartFetch(Routes.API(Routes.VALIDATION_LIST), uploadFormData);

		if (response.error) {
			useToast.error({
				message: response.error,
				title: 'Erro ao criar validação',
			});
			setIsSaving(false);
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
				validation,
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
	}, [availableAgencies, form, isLoading, isSaving, validationId, canSave, file, fileError, error, validation]);

	// F. Render Components
	return (
		<ValidationDetailContext.Provider value={contextValue}>
			{children}
		</ValidationDetailContext.Provider>
	);
};
