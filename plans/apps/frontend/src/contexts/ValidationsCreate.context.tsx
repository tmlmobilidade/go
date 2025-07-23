'use client';

/* * */

import { CREATE_VALIDATION_MODAL_ID } from '@/components/validations/detail/CreateValidationModal';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { Routes } from '@/lib/routes';
import { Permissions } from '@tmlmobilidade/lib';
import { CreateValidationDto, CreateValidationSchema, GtfsAgency, GtfsFeedInfo, ValidationPermission } from '@tmlmobilidade/types';
import { closeModal, useForm, UseFormReturnType, useMeContext, useToast, zodResolver } from '@tmlmobilidade/ui';
import { multipartFetch } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mutate } from 'swr';

/* * */

interface ValidationsCreateContextState {
	actions: {
		saveValidation: () => void
		setValidationFile: (file: File | null) => void
	}
	data: {
		agencies: { label: string, value: string }[]
		form: UseFormReturnType<CreateValidationDto>
	}
	flags: {
		error: Error | null
		loading: boolean
	}
}

/* * */

const ValidationsCreateContext = createContext<undefined | ValidationsCreateContextState>(undefined);

export function useValidationsCreateContext() {
	const context = useContext(ValidationsCreateContext);
	if (!context) {
		throw new Error('useValidationsCreateContext must be used within a ValidationsCreateContextProvider');
	}
	return context;
}

/* * */

export const ValidationsCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const workerRef = useRef<null | Worker>(null);
	const meContext = useMeContext();
	const agenciesContext = useAgenciesContext();

	const [isSaving, setIsSaving] = useState(false);
	const [canSave, setCanSave] = useState(false);
	const [validationFile, setValidationFile] = useState<File | null>(null);
	const [validationError, setValidationError] = useState<Error | null>(null);

	//
	// B. Define form
	const form = useForm<CreateValidationDto>({
		validate: zodResolver(CreateValidationSchema) as unknown,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Transform Data

	// Validate form on change
	// useEffect(() => {
	// 	form.validate();
	// }, [form.values]);

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

			// Check if the agency is in the permissions
			const hasPermission = meContext.actions.hasPermissionResource<ValidationPermission>({
				action: Permissions.validations.actions.create,
				resource_key: 'agency_ids',
				scope: Permissions.validations.scope,
				value: agency.agency_id,
			});

			if (!hasPermission) {
				setCanSave(false);
				setValidationError({
					message: 'Não tem permissão para criar validações para esta agência',
					name: 'ValidationError',
				});
				console.log('validationError', validationError);
				return;
			}

			setCanSave(true);
		};
	}, [validationFile]);

	const availableAgencies = useMemo(() => {
		return agenciesContext.data.raw.map(agency => ({
			label: agency.name,
			value: agency._id,
		}));
	}, [agenciesContext.data.raw]);

	//
	// D. Define actions
	const createValidation = async () => {
		setIsSaving(true);
		const uploadFormData = new FormData();

		uploadFormData.append('agency_id', form.values.gtfs_agency.agency_id);
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
		mutate(Routes.API(Routes.VALIDATION_LIST));
	};

	const saveValidation = () => {
		createValidation();
	};

	//
	// E. Define context value
	const contextValue: ValidationsCreateContextState = useMemo(() => {
		return {
			actions: {
				saveValidation,
				setValidationFile,
			},
			data: {
				agencies: availableAgencies,
				form: form,
			},
			flags: {
				error: validationError,
				loading: isSaving,
			},
		};
	}, [availableAgencies, form, isSaving, canSave, validationError]);

	// F. Render Components
	return (
		<ValidationsCreateContext.Provider value={contextValue}>
			{children}
		</ValidationsCreateContext.Provider>
	);
};
