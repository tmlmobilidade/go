'use client';

import { type EventRule, EventRuleSchema, type HHMM } from '@tmlmobilidade/types';
import { useForm, type UseFormReturnType, zodResolver } from '@tmlmobilidade/ui';
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

interface EventData {
	agency_ids: string[]
	dates: string[]
}

interface RuleCreateContextState {
	actions: {
		deleteRule?: () => void
		submitRule: () => void
	}
	data: {
		eventData: EventData
		form: UseFormReturnType<EventRule>
	}
	flags: {
		isEditing: boolean
	}
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

	const form = useForm<EventRule>({
		initialValues: getInitialRuleValues(initialValues),
		mode: 'controlled',
		validate: zodResolver(EventRuleSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// B. Handle actions

	const handleSubmitRule = useCallback(() => {
		if (form.values.kind === 'event_restriction' && form.values.all_day) {
			form.setFieldValue('start_time', ALL_DAY_RESTRICTION_START_TIME);
			form.setFieldValue('end_time', ALL_DAY_RESTRICTION_END_TIME);
		}

		// Validate form
		const validation = form.validate();
		if (validation.hasErrors) {
			return;
		}

		// Get the rule values and add the generated name
		const ruleValues = {
			...form.getValues(),
		};

		// Call the onSubmit callback
		onSubmit(ruleValues);

		// Close the modal
		closeCreateRuleModal();
	}, [form, onSubmit]);

	const handleDeleteRule = useCallback(() => {
		if (onDelete) {
			onDelete();
			closeCreateRuleModal();
		}
	}, [onDelete]);

	//
	// C. Define context value

	const contextValue: RuleCreateContextState = useMemo(() => ({
		actions: {
			deleteRule: onDelete ? handleDeleteRule : undefined,
			submitRule: handleSubmitRule,
		},
		data: {
			eventData,
			form,
		},
		flags: {
			isEditing: Boolean(initialValues),
		},
	}), [eventData, form, handleDeleteRule, handleSubmitRule, initialValues, onDelete]);

	//
	// D. Render components

	return (
		<RuleCreateContext.Provider value={contextValue}>
			{children}
		</RuleCreateContext.Provider>
	);

	//
};
