'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateEventSchema, type Event, EventRule, Line, PermissionCatalog, type UpdateEventDto, UpdateEventSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

import { openCreateRuleModal } from '../rules/RuleCreate.modal';

/* * */

interface EventsDetailContextState {
	actions: DetailContextStateTemplate['actions'] & {
		addRule: (rule: EventRule) => void
		deleteRule: (ruleId: string) => void
		editRule: (rule: EventRule) => void
		openRuleModal: (rule?: EventRule) => void
	}
	data: {
		event: Event | null
		form: UseFormReturnType<UpdateEventDto>
		id: string
		lines?: Line[]
	}
	flags: DetailContextStateTemplate['flags']
}

/* * */

const EventsDetailContext = createContext<EventsDetailContextState | undefined>(undefined);

export function useEventsDetailContext() {
	const context = useContext(EventsDetailContext);
	if (!context) {
		throw new Error('useEventsDetailContext must be used within a EventsDetailContextProvider');
	}
	return context;
}

/* * */

export const EventsDetailContextProvider = ({ children, eventId }: PropsWithChildren<{ eventId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: eventsListMutate } = useSWR<Event[]>(API_ROUTES.dates.EVENTS_LIST);
	const { data: eventData, error: eventError, isLoading: eventLoading, mutate: eventMutate } = useSWR<Event>(API_ROUTES.dates.EVENTS_DETAIL(eventId));
	const { data: allLinesData } = useSWR<Line[], Error>(API_ROUTES.offer.LINES_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateEventDto>(UpdateEventSchema, eventData, CreateEventSchema.parse({}), 'controlled');

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Event>(API_ROUTES.dates.EVENTS_DETAIL(eventId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			eventMutate(updatedItem);
			eventsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Event>(API_ROUTES.dates.EVENTS_DETAIL(eventId), 'DELETE', eventData),
		onSuccess: () => {
			form.resetDirty();
			eventsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.dates.EVENTS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Event>(API_ROUTES.dates.EVENTS_DETAIL_LOCK(eventId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			eventMutate(updatedItem);
			eventsListMutate();
		},
	});

	//
	// Rules

	const handleAddRule = (rule: EventRule) => {
		const currentRules = (form.getValues().rules ?? []) as EventRule[];
		const ruleWithId = { ...rule, _id: crypto.randomUUID() };
		const newRules = [...currentRules, ruleWithId];

		form.setFieldValue('rules', newRules);
	};

	const handleEditRule = (rule: EventRule) => {
		if (!rule._id) {
			console.error('Cannot edit rule without _id');
			return;
		}
		const currentRules = (form.getValues().rules ?? []) as EventRule[];
		const newRules = currentRules.map(r =>
			r._id === rule._id ? rule : r,
		);

		form.setFieldValue('rules', newRules);
	};

	const handleDeleteRule = (ruleId: string) => {
		const currentRules = (form.getValues().rules ?? []) as EventRule[];
		const newRules = currentRules.filter(r => r._id !== ruleId);

		form.setFieldValue('rules', newRules);
	};

	const handleOpenRuleModal = (rule?: EventRule) => {
		const onSubmit = (validatedRule: EventRule) => {
			if (rule?._id) {
				// Editing - preserve the _id
				handleEditRule({ ...validatedRule, _id: rule._id });
			}
			else {
				// Creating new
				handleAddRule(validatedRule);
			}
		};

		const onDelete = rule?._id ? () => handleDeleteRule(rule._id) : undefined;

		const eventData = {
			agency_ids: form.values.agency_ids || [],
			dates: form.values.dates || [],
		};

		openCreateRuleModal(eventData, rule, onSubmit, onDelete);
	};

	//
	// E. Setup permissions

	// For read permission, user needs access to at least ONE agency (requireAll: false)
	const viewPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.events.actions,
		resource: {
			key: 'agency_ids',
			requireAll: false,
			value: eventData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.events.scope,
	});

	// For update/delete/lock permissions, user needs access to ALL agencies (requireAll: true)
	const editPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.events.actions,
		resource: {
			key: 'agency_ids',
			requireAll: true,
			value: eventData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.events.scope,
	});

	const permissions = useMemo(() => ({
		delete: editPermissions.delete,
		lock: editPermissions.lock,
		read: viewPermissions.read,
		update: editPermissions.update,
	}), [editPermissions, viewPermissions]);

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!eventError,
		isDeleted: null,
		isDeleting,
		isDirty: form.isDirty(),
		isLoading: eventLoading,
		isLocked: eventData?.is_locked,
		isLocking,
		isSaving: isSaving,
		isValid: form.isValid(),
		permissions: {
			delete: permissions.delete,
			lock: permissions.lock,
			read: permissions.read,
			update: permissions.update,
		},
	});

	//
	// F. Define context value

	// Filter lines by event's agency_ids
	const filteredLines = useMemo(() => {
		if (!allLinesData || !form.values.agency_ids?.length) return [];
		const agencyIdsSet = new Set(form.values.agency_ids);
		return allLinesData.filter(line => agencyIdsSet.has(line.agency_id));
	}, [allLinesData, form.values.agency_ids]);

	const contextValue: EventsDetailContextState = useMemo(() => ({
		actions: {
			addRule: handleAddRule,
			delete: handleDelete,
			deleteRule: handleDeleteRule,
			editRule: handleEditRule,
			lock: handleLock,
			openRuleModal: handleOpenRuleModal,
			save: handleSave,
		},
		data: {
			event: eventData,
			form,
			id: eventId,
			lines: filteredLines,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: eventError,
			isDeleting,
			isLoading: eventLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
	}), [
		eventData,
		eventError,
		eventLoading,
		eventId,
		form,
		isSaving,
		filteredLines,
	]);

	//
	// G. Render components

	return (
		<EventsDetailContext.Provider value={contextValue}>
			{children}
		</EventsDetailContext.Provider>
	);

	//
};
