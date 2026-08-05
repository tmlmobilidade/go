'use client';

import { closeCreateValidationModal } from '@/components/validations/create/ValidationCreate.modal';
import { type WorkerMessage } from '@/types/worker';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type CreateGtfsValidationDto, type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { type SelectDataItem, useDataAgencies, useForm, UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { multipartFetch } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mutate } from 'swr';

/* * */

interface ValidationCreateContextState {
	actions: {
		createValidation: () => void
		setSelectedAgencyId: (agencyId: null | string) => void
		setValidationFile: (file: File | null) => void
	}
	data: {
		agency_options: SelectDataItem[]
		form: UseFormReturnType<CreateGtfsValidationDto>
		selected_agency_id: null | string
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

	const [isLoading, setIsLoading] = useState(false);
	const [gtfsAgencyCode, setGtfsAgencyCode] = useState<null | string>(null);
	const [selectedAgencyId, setSelectedAgencyId] = useState<null | string>(null);
	const [validationFile, setValidationFile] = useState<File | null>(null);
	const [validationError, setValidationError] = useState<Error | null>(null);

	//
	// B. Fetch data

	const { error: agenciesError, filtered: permittedAgencies, isLoading: agenciesLoading } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.gtfs_validations.actions.create],
		scope: PermissionCatalog.all.gtfs_validations.scope,
	});

	//
	// C. Setup form

	const form = useForm<CreateGtfsValidationDto>({ validateInputOnBlur: true, validateInputOnChange: true });
	const formRef = useRef(form);
	formRef.current = form;

	//
	// D. Transform data

	const matchingAgencies = useMemo(() => {
		if (!gtfsAgencyCode) return [];
		const normalizedGtfsAgencyCode = gtfsAgencyCode.trim().toLowerCase();
		return permittedAgencies.filter(agency => agency.code.trim().toLowerCase() === normalizedGtfsAgencyCode);
	}, [gtfsAgencyCode, permittedAgencies]);

	const agencyOptions = useMemo(() => matchingAgencies.map(agency => ({
		label: `${agency._id} - ${agency.name}`,
		value: agency._id,
	})), [matchingAgencies]);

	const canCreate = Boolean(
		validationFile
		&& selectedAgencyId
		&& matchingAgencies.some(agency => agency._id === selectedAgencyId)
		&& !agenciesLoading
		&& !isLoading,
	);

	//
	// E. Handle actions

	const handleWorkerMessage = useCallback((event: MessageEvent<WorkerMessage>) => {
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

		formRef.current.setValues({
			gtfs_agency: event.data.agency,
			gtfs_feed_info: event.data.feed_info,
		});
		setGtfsAgencyCode(event.data.agency.agency_id);

		//
	}, []);

	const selectAgency = useCallback((agencyId: null | string) => {
		setSelectedAgencyId(
			agencyId && matchingAgencies.some(agency => agency._id === agencyId)
				? agencyId
				: null,
		);
	}, [matchingAgencies]);

	const createValidation = useCallback(async () => {
		//

		//
		// Ensure an agency and file were selected

		if (!selectedAgencyId || !validationFile) return;

		//
		// Update state to indicate progress

		setIsLoading(true);

		//
		// Setup a new FormData object to send
		// the GTFS file and associated metadata

		const uploadFormData = new FormData();

		uploadFormData.append('agency_id', selectedAgencyId);
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
	}, [form, router, selectedAgencyId, validationFile]);

	//
	// F. Handle effects

	useEffect(() => {
		// Wait until the GTFS and permitted agencies are available
		if (!gtfsAgencyCode || agenciesLoading) return;

		if (agenciesError || matchingAgencies.length === 0) {
			setSelectedAgencyId(null);
			setValidationError({
				message: 'Não é permitido criar validações para esta agência.',
				name: 'ValidationError',
			});
			return;
		}

		setValidationError(null);

		if (matchingAgencies.length === 1) {
			setSelectedAgencyId(matchingAgencies[0]._id);
			return;
		}

		setSelectedAgencyId(currentAgencyId => (
			matchingAgencies.some(agency => agency._id === currentAgencyId)
				? currentAgencyId
				: null
		));
	}, [agenciesError, agenciesLoading, gtfsAgencyCode, matchingAgencies]);

	useEffect(() => {
		//

		//
		// Reset the form and state
		// when there is no validation file

		if (!validationFile) {
			setGtfsAgencyCode(null);
			setSelectedAgencyId(null);
			setValidationError(null);
			formRef.current.reset();
			return;
		}

		setGtfsAgencyCode(null);
		setSelectedAgencyId(null);
		setValidationError(null);
		formRef.current.reset();

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
	}, [handleWorkerMessage, validationFile]);

	//
	// G. Define context value

	const contextValue: ValidationCreateContextState = useMemo(() => {
		return {
			actions: {
				createValidation,
				setSelectedAgencyId: selectAgency,
				setValidationFile,
			},
			data: {
				agency_options: agencyOptions,
				form: form,
				selected_agency_id: selectedAgencyId,
			},
			flags: {
				can_create: canCreate,
				error: validationError,
				loading: isLoading,
			},
		};
	}, [agencyOptions, canCreate, createValidation, form, isLoading, selectAgency, selectedAgencyId, validationError]);

	//
	// H. Render components

	return (
		<ValidationCreateContext.Provider value={contextValue}>
			{children}
		</ValidationCreateContext.Provider>
	);

	//
};
