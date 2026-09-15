'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Event, type UpdateEventDto, UpdateEventSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useEventsListData } from '../list/use-events-list-data';
import { useEventsDetailData } from './use-events-detail-data';
import { useEventsDetailEventId } from './use-events-detail-event-id';

/* * */

const EventsDetailFormContext = createContext<StandardFormContextValue<UpdateEventDto> | undefined>(undefined);

export function useEventsDetailFormContext() {
	const context = useContext(EventsDetailFormContext);
	if (!context) throw new Error('useEventsDetailFormContext must be used within a EventsDetailFormContextProvider');
	return context;
}

/* * */

export function EventsDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { eventId } = useEventsDetailEventId();

	const { data: meData } = useMeData();

	const { mutate: eventsListMutate } = useEventsListData();

	const { data: eventData, isLoading: eventDataLoading, mutate: eventsDetailMutate } = useEventsDetailData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateEventDto, typeof UpdateEventSchema>({
		apiData: eventData,
		schema: UpdateEventSchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Event>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.dates.EVENTS_DETAIL(eventId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			eventsDetailMutate(response);
			eventsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Event>({ method: 'DELETE', url: API_ROUTES.dates.EVENTS_DETAIL(eventId) }),
		onSuccess: () => {
			unblock();
			eventsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.dates.EVENTS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<Event>({ url: API_ROUTES.dates.EVENTS_DETAIL_LOCK(eventId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			eventsDetailMutate(response);
			eventsListMutate();
		},
	});

	//
	// D. Setup flags

	const { hasDeletePermission, hasLockPermission, hasUpdatePermission } = useMemo(() => {
		const hasPermissionForAllAgencies = (action: 'delete' | 'lock' | 'update') => PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.events.actions[action],
			permissions: meData?.permissions ?? [],
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.events.scope,
			value: eventData?.agency_ids ?? [],
		});
		return {
			hasDeletePermission: hasPermissionForAllAgencies('delete'),
			hasLockPermission: hasPermissionForAllAgencies('lock'),
			hasUpdatePermission: hasPermissionForAllAgencies('update'),
		};
	}, [eventData?.agency_ids, meData?.permissions]);

	const { deleteEnabled, editEnabled, lockEnabled, updateEnabled } = useStandardFormCapabilities({
		delete: {
			hasPermission: hasDeletePermission,
			isDeleting: isDeleting,
		},
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: eventDataLoading,
		},
		locked: {
			hasPermission: hasLockPermission,
			isLocked: eventData?.is_locked ?? false,
			isLocking: isLocking,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

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
			isLoading: eventDataLoading,
			isLocked: eventData?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [eventData?.is_locked, eventDataLoading, deleteEnabled, editEnabled, form, handleDelete, handleLock, handleUpdate, isDeleting, isDirty, isLocking, isUpdating, isValid, lockEnabled, unblock, updateEnabled]);

	return (
		<EventsDetailFormContext.Provider value={stateValue}>
			{children}
		</EventsDetailFormContext.Provider>
	);
}
