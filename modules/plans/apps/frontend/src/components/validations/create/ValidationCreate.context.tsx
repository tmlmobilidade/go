'use client';

/* * */

import { closeCreateValidationModal } from '@/components/validations/create/ValidationCreate.modal';
import { type WorkerMessage } from '@/types/worker';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type CreateGtfsValidationDto, type GtfsValidation, PermissionCatalog } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useMeContext, useToast } from '@tmlmobilidade/ui';
import { multipartFetch } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mutate } from 'swr';

/* * */

interface ValidationCreateContextState {
	actions: {
		createValidation: () => void
		setValidationFile: (file: File | null) => void
	}
	data: {
		form: UseFormReturnType<CreateGtfsValidationDto>
	}
	flags: {
		can_create: boolean
		error: Error | null
		loading: boolean
	}
}

/* * */

const ValidationCreateContext = createContext<undefined | ValidationCreateContextState>(undefined);

export function useValidationCreateContext() {
	const context = useContext(ValidationCreateContext);
	if (!context) {
		throw new Error('useValidationCreateContext must be used within a ValidationCreateContextProvider');
	}
	return context;
}

/* * */

export const ValidationCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const workerRef = useRef<null | Worker>(null);
	const meContext = useMeContext();

	const [isLoading, setIsLoading] = useState(false);
	const [canCreate, setCanCreate] = useState(false);
	const [validationFile, setValidationFile] = useState<File | null>(null);
	const [validationError, setValidationError] = useState<Error | null>(null);

	//
	// B. Setup form

	const form = useForm<CreateGtfsValidationDto>({
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Handle actions

	const handleWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
		//

		//
		// If the worker returns an error, display it and reset the form

		if (event.data.error) {
			useToast.error({ message: event.data.error.message, title: 'Erro ao criar Validação' });
			return;
		}

		//
		// If the worker returns a valid agency and feed info,
		// update the form values and check permissions

		form.setValues({
			gtfs_agency: event.data.agency,
			gtfs_feed_info: event.data.feed_info,
		});

		//
		// Check if the current user has permission
		// to create validations for the GTFS agency

		const hasPermission = meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.create,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: event.data.agency.agency_id,
		});

		if (!hasPermission) {
			setCanCreate(false);
			setValidationError({
				message: 'Não é permitido criar validações para esta agência.',
				name: 'ValidationError',
			});
			return;
		}

		setCanCreate(true);

		//
	};

	const createValidation = async () => {
		//

		//
		// Update state to indicate progress

		setIsLoading(true);

		//
		// Setup a new FormData object to send
		// the GTFS file and associated metadata

		const uploadFormData = new FormData();

		uploadFormData.append('agency_id', form.values.gtfs_agency.agency_id);
		uploadFormData.append('gtfs_agency', JSON.stringify(form.values.gtfs_agency));
		uploadFormData.append('gtfs_feed_info', JSON.stringify(form.values.gtfs_feed_info));
		uploadFormData.append('processing_status', form.values.processing_status);
		uploadFormData.append('validity_status', form.values.validity_status);
		uploadFormData.append('file', validationFile);

		//
		// Perform the API request to create the validation

		const response = await multipartFetch<GtfsValidation>(API_ROUTES.plans.VALIDATIONS_LIST, uploadFormData);

		//
		// Handle the response

		if (response.error || !response.data?._id) {
			useToast.error({ message: response.error, title: 'Erro ao iniciar Validação' });
			setIsLoading(false);
			return;
		}

		if (!response.data?._id) {
			useToast.error({ message: response.error, title: 'Erro ao iniciar Validação' });
			setIsLoading(false);
			return;
		}

		router.push(`/validations/${response.data._id}`);

		useToast.success({
			message: 'Validação em progresso.',
			title: 'Sucesso',
		});

		//
		// Reset the form and state

		setIsLoading(false);
		closeCreateValidationModal();
		await mutate(API_ROUTES.plans.VALIDATIONS_LIST);

		//
	};

	useEffect(() => {
		//

		//
		// Reset the form and state
		// when there is no validation file

		if (!validationFile) {
			setCanCreate(false);
			form.reset();
			return;
		}

		//
		// Setup a new worker instance to process the GTFS file.
		// If a worker already exists, terminate it to avoid duplicate processing.

		if (workerRef.current) {
			workerRef.current.terminate();
		}

		workerRef.current = new Worker(new URL('@/workers/gtfs-info.worker.ts', import.meta.url));

		workerRef.current.postMessage({ file: validationFile });

		workerRef.current.onmessage = handleWorkerMessage;

		//
	}, [validationFile]);

	//
	// E. Define context value

	const contextValue: ValidationCreateContextState = useMemo(() => {
		return {
			actions: {
				createValidation,
				setValidationFile,
			},
			data: {
				form: form,
			},
			flags: {
				can_create: canCreate,
				error: validationError,
				loading: isLoading,
			},
		};
	}, [
		form,
		isLoading,
		canCreate,
		validationError,
	]);

	//
	// F. Render components

	return (
		<ValidationCreateContext.Provider value={contextValue}>
			{children}
		</ValidationCreateContext.Provider>
	);

	//
};
