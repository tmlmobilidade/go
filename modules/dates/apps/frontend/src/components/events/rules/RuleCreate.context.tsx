'use client';

import { usePeriodsListContext } from '@/components/year-periods/list/PeriodsList.context';
import { useForm } from '@mantine/form';
import { EventRule, EventRuleSchema, HHMM } from '@tmlmobilidade/types';
import { type UseFormReturnType } from '@tmlmobilidade/ui';
import { zodResolver } from 'mantine-form-zod-resolver';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { closeCreateRuleModal } from './RuleCreate.modal';

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

/* * */

const RuleCreateContext = createContext<RuleCreateContextState | undefined>(undefined);

export const useRuleCreateContext = () => {
	const context = useContext(RuleCreateContext);
	if (!context) {
		throw new Error('useRuleCreateContext must be used within a RuleCreateContextProvider');
	}
	return context;
};

/* * */

export const RuleCreateContextProvider = ({ children, eventData, initialValues, onDelete, onSubmit }: PropsWithChildren<{ eventData: EventData, initialValues?: EventRule, onDelete?: () => void, onSubmit: (rule: EventRule) => void }>) => {
	//

	//
	// A. Setup form

	const form = useForm<EventRule>({
		initialValues: initialValues || {
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
		},
		mode: 'controlled',
		validate: zodResolver(EventRuleSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// B. Handle actions

	const handleSubmitRule = useCallback(() => {
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
