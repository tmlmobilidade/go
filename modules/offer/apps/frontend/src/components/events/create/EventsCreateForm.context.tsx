'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateEventDto, CreateEventSchema, type Event } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getEventsPermissions } from '../shared/events-permissions';
import { useEventsData } from '../shared/use-events-data';
import { closeCreateEventModal } from './EventCreate.modal';

/* * */

const EventsCreateFormContext = createContext<StandardFormContextValue<CreateEventDto> | undefined>(undefined);

/* * */

export function useEventsCreateFormContext() {
	const context = useContext(EventsCreateFormContext);
	if (!context) throw new Error('useEventsCreateFormContext must be used within EventsCreateFormContextProvider');
	return context;
}

/* * */

export function EventsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useEventsData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<CreateEventDto, typeof CreateEventSchema>({
		defaultValues: {
			agency_ids: [],
			code: '',
			dates: [],
			description: '',
			is_locked: false,
			rules: [],
			title: '',
		},
		schema: CreateEventSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = CreateEventSchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleCreateRequest, isLoading: isCreating } = useHandleAction({
		fetchFn: async (data: CreateEventDto) => await fetchApiData<Event>({ body: data, method: 'POST', url: API_ROUTES.offer.EVENTS_CREATE }),
		onSuccess: (response) => {
			form.reset();
			unblock();
			listMutate();
			closeCreateEventModal();
			if (response.data) router.push(keepUrlParams(PAGE_ROUTES.offer.EVENTS_DETAIL(response.data._id)));
		},
	});

	//
	// D. Setup permissions

	const permissions = getEventsPermissions({
		selectedAgencyIds: values.agency_ids ?? [],
		userPermissions: me?.permissions,
	});

	//
	// E. Setup capabilities and handlers

	const { createEnabled, editEnabled: formEditEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: permissions.create && !meError,
			isCreating: isCreating || meLoading,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	const editEnabled = formEditEnabled && permissions.create && !meLoading && !meError;

	const handleCreate = useCallback(async () => {
		if (!createEnabled) return;
		await form.handleSubmit(handleCreateRequest)();
	}, [createEnabled, form, handleCreateRequest]);

	//
	// F. Return context value

	const stateValue: StandardFormContextValue<CreateEventDto> = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		capabilities: {
			createEnabled,
			editEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isCreating,
		},
		unblock,
	}), [createEnabled, editEnabled, form, handleCreate, isCreating, unblock, isDirty, isValid]);

	return (
		<EventsCreateFormContext.Provider value={stateValue}>
			{children}
		</EventsCreateFormContext.Provider>
	);
}
