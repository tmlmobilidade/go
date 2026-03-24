'use client';

/* * */

import { useEventsContext } from '@/contexts/Events.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { useForm } from '@mantine/form';
import { buildRuleSummary, Dates, getManualRuleAffectedDates } from '@tmlmobilidade/dates';
import { ManualRule, ManualRuleSchema } from '@tmlmobilidade/types';
import { type UseFormReturnType } from '@tmlmobilidade/ui';
import { zodResolver } from 'mantine-form-zod-resolver';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { closeCreateRuleModal } from './RuleCreate.modal';

/* * */

interface RuleCreateContextState {
	actions: {
		closeDrawer: () => void
		deleteRule?: () => void
		openDrawer: () => void
		setEventExceptionEnabled: (enabled: boolean) => void
		submitRule: () => void
	}
	data: {
		form: UseFormReturnType<ManualRule>
		ruleImpact: {
			count: number
			dates: string[]
		}
		ruleSummary: { long: string, short: string }
	}
	flags: {
		isDrawerOpen: boolean
		isEditing: boolean
		isEventExceptionEnabled: boolean
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

export const RuleCreateContextProvider = ({ children, initialValues, onDelete, onSubmit }: PropsWithChildren<{ initialValues?: ManualRule, onDelete?: () => void, onSubmit: (rule: ManualRule) => void }>) => {
	//

	//
	// A. Setup variables

	const periodsContext = usePeriodsContext();
	const eventsContext = useEventsContext();
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isEventExceptionEnabled, setIsEventExceptionEnabled] = useState(Boolean(initialValues?.event_id));

	//
	// B. Fetch data

	//
	// C. Setup form

	const form = useForm<ManualRule>({
		initialValues: initialValues || {
			_id: crypto.randomUUID(),
			kind: 'manual',
			operating_mode: 'include',
			timepoints: [],
			weekdays: [],
			year_period_ids: [],
		},
		mode: 'controlled',
		validate: zodResolver(ManualRuleSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	//

	const ruleSummary = useMemo(() => buildRuleSummary(form.values, {
		events: eventsContext.data.raw,
		periods: periodsContext.data.raw,
	}),
	[eventsContext.data.raw, form.values, periodsContext.data.raw]);

	const ruleImpact = useMemo(() => getManualRuleAffectedDates(
		form.values,
		{
			endDate: Dates.now('Europe/Lisbon').plus({ years: 1 }).js_date,
			events: eventsContext.data.raw,
			periods: periodsContext.data.raw,
			startDate: new Date(),
		},
	), [eventsContext.data.raw, form.values, periodsContext.data.raw]);

	//
	// D. Handle actions

	const handleSubmitRule = useCallback(() => {
		// Validate form
		const validation = form.validate();
		if (validation.hasErrors) {
			return;
		}

		// Get the rule values and add the generated name
		const ruleValues = {
			...form.getValues(),
			name: ruleSummary.long,
			shortName: ruleSummary.short,
		};

		// Call the onSubmit callback
		onSubmit(ruleValues);

		// Close the modal
		closeCreateRuleModal();
	}, [form, ruleSummary.long, ruleSummary.short, onSubmit]);

	const handleDeleteRule = useCallback(() => {
		if (onDelete) {
			onDelete();
			closeCreateRuleModal();
		}
	}, [onDelete]);

	//
	// E. Define context value

	const contextValue: RuleCreateContextState = useMemo(() => ({
		actions: {
			closeDrawer: () => setIsDrawerOpen(false),
			deleteRule: onDelete ? handleDeleteRule : undefined,
			openDrawer: () => setIsDrawerOpen(true),
			setEventExceptionEnabled: (enabled: boolean) => setIsEventExceptionEnabled(enabled),
			submitRule: handleSubmitRule,
		},
		data: {
			form,
			ruleImpact,
			ruleSummary,
		},
		flags: {
			isDrawerOpen,
			isEditing: Boolean(initialValues),
			isEventExceptionEnabled,
		},
	}), [
		form,
		handleDeleteRule,
		handleSubmitRule,
		initialValues,
		ruleImpact,
		ruleSummary,
		isDrawerOpen,
		isEventExceptionEnabled,
		onDelete,
	]);

	//
	// H. Render components

	return (
		<RuleCreateContext.Provider value={contextValue}>
			{children}
		</RuleCreateContext.Provider>
	);

	//
};
