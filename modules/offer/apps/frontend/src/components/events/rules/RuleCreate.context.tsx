'use client';

import { type Event, type EventRule, EventRuleSchema, type HHMM } from '@tmlmobilidade/go-types-offer';
import { type StandardFormContextValue, useStandardForm, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { closeCreateRuleModal } from './RuleCreate.modal';

/* * */

const ALL_DAY_RESTRICTION_END_TIME = '29:59' as HHMM;
const ALL_DAY_RESTRICTION_START_TIME = '04:00' as HHMM;

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
		kind: 'event_restriction',
		lines_mode: 'all',
		start_time: '' as HHMM,
	};
}

/* * */

interface EventData {
	agency_ids: string[]
	dates: Event['dates']
}

interface RuleCreateContextState extends StandardFormContextValue<EventRule> {
	eventData: EventData
	isEditing: boolean
	values: EventRule
}

interface RuleCreateContextProviderProps {
	eventData: EventData
	initialValues?: EventRule
	onDelete?: () => void
	onSubmit: (rule: EventRule) => void
}

/* * */

const RuleCreateContext = createContext<RuleCreateContextState | undefined>(undefined);

export function useRuleCreateContext() {
	const context = useContext(RuleCreateContext);
	if (!context) {
		throw new Error('useRuleCreateContext must be used within a RuleCreateContextProvider');
	}
	return context;
}

/* * */

export const RuleCreateContextProvider = ({ children, eventData, initialValues, onDelete, onSubmit }: PropsWithChildren<RuleCreateContextProviderProps>) => {
	//

	//
	// A. Setup form

	const { form, isDirty, unblock } = useStandardForm<EventRule, typeof EventRuleSchema>({
		defaultValues: { ...getInitialRuleValues(initialValues), dates: initialValues?.dates ?? eventData.dates },
		schema: EventRuleSchema,
	});
	// Subscribe to edits, then read the typed form values (the watch hook returns deep partials).
	useStandardFormWatch({ control: form.control });
	const values = form.getValues();
	const isValid = EventRuleSchema.safeParse(values).success;

	//
	// B. Handle actions

	const handleSubmitRule = useCallback(async () => {
		const current = form.getValues();
		if (current.kind === 'event_restriction' && current.all_day) {
			form.setValue('start_time', ALL_DAY_RESTRICTION_START_TIME);
			form.setValue('end_time', ALL_DAY_RESTRICTION_END_TIME);
		}
		await form.handleSubmit((validatedRule) => {
			onSubmit(validatedRule);
			unblock();
			closeCreateRuleModal();
		})();
	}, [form, onSubmit, unblock]);

	const handleDeleteRule = useCallback(() => {
		if (onDelete) {
			onDelete();
			closeCreateRuleModal();
		}
	}, [onDelete]);

	//
	// C. Define context value

	const stateValue: RuleCreateContextState = useMemo(() => ({
		actions: {
			create: handleSubmitRule,
			delete: onDelete ? handleDeleteRule : undefined,
			update: handleSubmitRule,
		},
		capabilities: {
			createEnabled: isValid,
			deleteEnabled: !!onDelete,
			editEnabled: true,
			updateEnabled: isValid,
		},
		eventData,
		form,
		isDirty,
		isEditing: Boolean(initialValues),
		isValid,
		status: {},
		unblock,
		values,
	}), [eventData, form, handleDeleteRule, handleSubmitRule, initialValues, onDelete, isDirty, isValid, unblock, values]);

	//
	// D. Render components

	return (
		<RuleCreateContext.Provider value={stateValue}>
			{children}
		</RuleCreateContext.Provider>
	);

	//
};
