'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Event, type UpdateEventDto, UpdateEventSchema } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getEventsPermissions } from '../shared/events-permissions';
import { useEventsData } from '../shared/use-events-data';
import { useEventsDetailData } from './use-events-detail-data';
import { useEventsDetailEventId } from './use-events-detail-event-id';

/* * */

const EventsDetailFormContext = createContext<StandardFormContextValue<UpdateEventDto> | undefined>(undefined);

/* * */

export function useEventsDetailFormContext() {
	const context = useContext(EventsDetailFormContext);
	if (!context) throw new Error('useEventsDetailFormContext must be used within EventsDetailFormContextProvider');
	return context;
}

/* * */

export function EventsDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useEventsData();
	const { eventId } = useEventsDetailEventId();
	const { data: event, error, isLoading, mutate: detailMutate } = useEventsDetailData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<UpdateEventDto, typeof UpdateEventSchema>({
		apiData: event,
		schema: UpdateEventSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = UpdateEventSchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleUpdateRequest, isLoading: isUpdating } = useHandleAction({
		fetchFn: async (data: UpdateEventDto) => await fetchApiData<Event>({ body: UpdateEventSchema.parse(data), method: 'PUT', url: API_ROUTES.offer.EVENTS_DETAIL(eventId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate();
			listMutate();
		},
	});
	const { action: handleLockRequest, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<Event>({ url: API_ROUTES.offer.EVENTS_DETAIL_LOCK(eventId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate();
			listMutate();
		},
	});
	const { action: handleDeleteRequest, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ method: 'DELETE', url: API_ROUTES.offer.EVENTS_DETAIL(eventId) }),
		onSuccess: () => {
			form.reset();
			unblock();
			listMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.EVENTS_LIST));
		},
	});

	//
	// D. Setup permissions

	const permissions = getEventsPermissions({
		currentAgencyIds: event?.agency_ids ?? [],
		selectedAgencyIds: values.agency_ids ?? [],
		userPermissions: me?.permissions,
	});

	//
	// E. Setup capabilities and handlers

	const busy = isUpdating || isLocking || isDeleting;
	const loading = isLoading || meLoading || !event || !!error || !!meError;

	const standardCapabilities = useStandardFormCapabilities({
		delete: {
			hasPermission: permissions.delete,
			isDeleting,
		},
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: loading,
		},
		locked: {
			hasPermission: permissions.lock,
			isLocked: event?.is_locked,
			isLocking,
		},
		update: {
			hasPermission: permissions.update,
			isUpdating,
		},
	});

	const deleteEnabled = standardCapabilities.deleteEnabled && !busy;
	const editEnabled = standardCapabilities.editEnabled && permissions.edit && !loading;
	const lockEnabled = standardCapabilities.lockEnabled && !busy;
	const updateEnabled = standardCapabilities.updateEnabled && !busy;

	const handleDelete = useCallback(() => {
		if (!deleteEnabled) return;
		void handleDeleteRequest();
	}, [deleteEnabled, handleDeleteRequest]);

	const handleLock = useCallback(() => {
		if (!lockEnabled) return;
		void handleLockRequest();
	}, [lockEnabled, handleLockRequest]);

	const handleUpdate = useCallback(async () => {
		if (!updateEnabled) return;
		await form.handleSubmit(handleUpdateRequest)();
	}, [updateEnabled, form, handleUpdateRequest]);

	//
	// F. Return context value

	const stateValue: StandardFormContextValue<UpdateEventDto> = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			update: handleUpdate,
		},
		capabilities: {
			deleteEnabled,
			editEnabled,
			lockEnabled,
			updateEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isDeleting,
			isLoading,
			isLocked: event?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [handleDelete, handleLock, handleUpdate, deleteEnabled, editEnabled, lockEnabled, updateEnabled, form, isDirty, isValid, isDeleting, isLoading, event?.is_locked, isLocking, isUpdating, unblock]);

	return (
		<EventsDetailFormContext.Provider value={stateValue}>
			{children}
		</EventsDetailFormContext.Provider>
	);
}
