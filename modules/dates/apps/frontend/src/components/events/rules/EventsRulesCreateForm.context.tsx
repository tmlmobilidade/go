'use client';

import { type EventRule, EventRuleSchema, type HHMM } from '@tmlmobilidade/go-types-offer';
import { type StandardFormContextValue, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { closeEventsRulesCreateModal } from './EventsRulesCreate.modal';

/* * */

export const ALL_DAY_RESTRICTION_END_TIME = '29:59' as HHMM;
export const ALL_DAY_RESTRICTION_START_TIME = '04:00' as HHMM;

/* * */

export interface EventsRulesCreateEventData {
	agency_ids: string[]
	dates: string[]
}

export interface EventsRulesCreateFormContextValue extends StandardFormContextValue<EventRule> {
	eventData: EventsRulesCreateEventData
	isEditing: boolean
	values: EventRule
}

interface EventsRulesCreateFormContextProviderProps {
	eventData: EventsRulesCreateEventData
	initialValues?: EventRule
	onDelete?: () => void
	onSubmit: (rule: EventRule) => void
}

/* * */

function getInitialRuleValues(initialValues?: EventRule): EventRule {
	if (initialValues?.kind === 'event_restriction' && initialValues.all_day) {
		return {
			...initialValues,
			end_time: initialValues.end_time || ALL_DAY_RESTRICTION_END_TIME,
			start_time: initialValues.start_time || ALL_DAY_RESTRICTION_START_TIME,
		};
	}
	return initialValues || {
		all_day: false,
		dates: [],
		end_time: '' as HHMM,
		event: {
			id: '',
			title: '',
		},
		kind: 'event_restriction',
		lines_mode: 'all',
		start_time: '' as HHMM,
	};
}

/* * */

const EventsRulesCreateFormContext = createContext<EventsRulesCreateFormContextValue | undefined>(undefined);

export function useEventsRulesCreateFormContext() {
	const context = useContext(EventsRulesCreateFormContext);
	if (!context) throw new Error('useEventsRulesCreateFormContext must be used within a EventsRulesCreateFormContextProvider');
	return context;
}

/* * */

export function EventsRulesCreateFormContextProvider({ children, eventData, initialValues, onDelete, onSubmit }: PropsWithChildren<EventsRulesCreateFormContextProviderProps>) {
	//

	//
	// A. Setup variables

	const isEditing = Boolean(initialValues);

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<EventRule, typeof EventRuleSchema>({
		defaultValues: getInitialRuleValues(initialValues),
		schema: EventRuleSchema,
	});

	const values = useStandardFormWatch({ control: form.control }) as EventRule;

	//
	// C. Handle actions

	const handleCreate = useCallback(async () => {
		// All day restrictions cover the whole operational day
		const currentValues = form.getValues();
		if (currentValues.kind === 'event_restriction' && currentValues.all_day) {
			form.setValue('start_time', ALL_DAY_RESTRICTION_START_TIME);
			form.setValue('end_time', ALL_DAY_RESTRICTION_END_TIME);
		}
		// Validate the rule before handing it to the event
		const isRuleValid = await form.trigger();
		if (!isRuleValid) return;
		onSubmit(form.getValues());
		closeEventsRulesCreateModal();
	}, [form, onSubmit]);

	const handleDelete = useCallback(() => {
		if (!onDelete) return;
		onDelete();
		closeEventsRulesCreateModal();
	}, [onDelete]);

	//
	// D. Setup flags

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: true,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	//
	// E. Return state

	const stateValue: EventsRulesCreateFormContextValue = useMemo(() => ({
		actions: {
			create: handleCreate,
			delete: onDelete ? handleDelete : undefined,
		},
		capabilities: {
			createEnabled,
			editEnabled,
		},
		eventData,
		form,
		isDirty,
		isEditing,
		isValid,
		status: {},
		unblock,
		values,
	}), [createEnabled, editEnabled, eventData, form, handleCreate, handleDelete, isDirty, isEditing, isValid, onDelete, unblock, values]);

	return (
		<EventsRulesCreateFormContext.Provider value={stateValue}>
			{children}
		</EventsRulesCreateFormContext.Provider>
	);
}
