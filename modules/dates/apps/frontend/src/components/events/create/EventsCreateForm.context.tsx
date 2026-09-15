'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateEventDto, CreateEventSchema, type Event } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useEventsListData } from '../list/use-events-list-data';
import { closeEventsCreateModal } from './EventsCreate.modal';

/* * */

const EventsCreateFormContext = createContext<StandardFormContextValue<CreateEventDto> | undefined>(undefined);

export function useEventsCreateFormContext() {
	const context = useContext(EventsCreateFormContext);
	if (!context) throw new Error('useEventsCreateFormContext must be used within a EventsCreateFormContextProvider');
	return context;
}

/* * */

export function EventsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: meData } = useMeData();

	const { mutate: eventsListMutate } = useEventsListData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateEventDto, typeof CreateEventSchema>({
		schema: CreateEventSchema,
	});

	//
	// C. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Event>({ body: form.getValues(), method: 'POST', url: API_ROUTES.dates.EVENTS_LIST }),
		onSuccess: ({ data }) => {
			closeEventsCreateModal();
			form.reset();
			unblock();
			eventsListMutate();
			if (!data?._id) return;
			router.push(keepUrlParams(PAGE_ROUTES.dates.EVENTS_DETAIL(data._id)));
		},
	});

	//
	// D. Setup flags

	const hasCreatePermission = useMemo(() => {
		return PermissionCatalog.hasPermission(meData?.permissions ?? [], PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.create);
	}, [meData?.permissions]);

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasCreatePermission,
			isCreating: isCreating,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	//
	// E. Return state

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
	}), [createEnabled, editEnabled, form, handleCreate, isCreating, isDirty, isValid, unblock]);

	return (
		<EventsCreateFormContext.Provider value={stateValue}>
			{children}
		</EventsCreateFormContext.Provider>
	);
}
