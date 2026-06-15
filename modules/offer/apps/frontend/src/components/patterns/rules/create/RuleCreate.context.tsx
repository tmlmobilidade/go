'use client';

import { useEventsContext } from '@/contexts/Events.context';
import { useHolidaysContext } from '@/contexts/Holidays.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { useForm } from '@mantine/form';
import { buildRuleSummary, Dates, getManualRuleAffectedDates } from '@tmlmobilidade/dates';
import { generateRandomString } from '@tmlmobilidade/strings';
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
		duplicateRule?: () => void
		openDrawer: () => void
		setEventExceptionEnabled: (enabled: boolean) => void
		setPreviewYear: (year: number) => void
		submitRule: () => void
	}
	data: {
		form: UseFormReturnType<ManualRule>
		ruleImpact: null | {
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

export const RuleCreateContextProvider = ({ children, initialValues, onDelete, onDuplicate, onSubmit }: PropsWithChildren<{ initialValues?: ManualRule, onDelete?: () => void, onDuplicate?: (rule: ManualRule) => void, onSubmit: (rule: ManualRule) => void }>) => {
	//

	//
	// A. Setup variables

	const periodsContext = usePeriodsContext();
	const holidaysContext = useHolidaysContext();
	const eventsContext = useEventsContext();
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isEventExceptionEnabled, setIsEventExceptionEnabled] = useState(Boolean(initialValues?.event_id));

	const [previewYear, setPreviewYear] = useState(Dates.now('Europe/Lisbon').js_date.getFullYear());

	//
	// B. Fetch data

	//
	// C. Setup form

	const form = useForm<ManualRule>({
		initialValues: initialValues || {
			_id: generateRandomString({ length: 5 }),
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

	const ruleImpact = useMemo(() => {
		const startDate = Dates.fromISO(`${previewYear}-01-01`).js_date;
		const endDate = Dates.fromISO(`${previewYear}-12-31`).js_date;

		return getManualRuleAffectedDates(
			form.values,
			{
				endDate,
				events: eventsContext.data.raw,
				holidays: holidaysContext.data.raw,
				periods: periodsContext.data.raw,
				startDate,
			},
		);
	}, [eventsContext.data.raw, form.values, periodsContext.data.raw, holidaysContext.data.raw, previewYear]);

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

	const handleDuplicateRule = useCallback(() => {
		const validation = form.validate();
		if (validation.hasErrors || !onDuplicate) {
			return;
		}

		const ruleValues = {
			...form.getValues(),
			name: ruleSummary.long,
			shortName: ruleSummary.short,
		};

		onDuplicate(ruleValues);
		closeCreateRuleModal();
	}, [form, onDuplicate, ruleSummary.long, ruleSummary.short]);

	//
	// E. Define context value

	const contextValue: RuleCreateContextState = useMemo(() => ({
		actions: {
			closeDrawer: () => setIsDrawerOpen(false),
			deleteRule: onDelete ? handleDeleteRule : undefined,
			duplicateRule: onDuplicate ? handleDuplicateRule : undefined,
			openDrawer: () => setIsDrawerOpen(true),
			setEventExceptionEnabled: (enabled: boolean) => setIsEventExceptionEnabled(enabled),
			setPreviewYear,
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
		handleDuplicateRule,
		handleSubmitRule,
		initialValues,
		ruleImpact,
		ruleSummary,
		isDrawerOpen,
		isEventExceptionEnabled,
		onDelete,
		onDuplicate,
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
