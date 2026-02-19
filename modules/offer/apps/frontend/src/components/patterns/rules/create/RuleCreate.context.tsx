'use client';

/* * */

import { usePeriodsContext } from '@/contexts/Periods.context';
import { useForm } from '@mantine/form';
import { buildRuleSummary, Dates, getManualRuleAffectedDates } from '@tmlmobilidade/dates';
import { ManualRule, ManualRuleSchema, OPERATING_MODE } from '@tmlmobilidade/types';
import { type UseFormReturnType } from '@tmlmobilidade/ui';
import { zodResolver } from 'mantine-form-zod-resolver';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

import { closeCreateRuleModal } from './RuleCreate.modal';

/* * */

interface RuleCreateContextState {
	actions: {
		closeDrawer: () => void
		deleteRule?: () => void
		openDrawer: () => void
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
	}
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

export const RuleCreateContextProvider = ({ children, initialValues, onDelete, onSubmit }: PropsWithChildren<{ initialValues?: ManualRule, onDelete?: () => void, onSubmit: (rule: ManualRule) => void }>) => {
	//

	//
	// A. Setup variables

	const periodsContext = usePeriodsContext();
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	//
	// B. Fetch data

	//
	// C. Setup form

	const form = useForm<ManualRule>({
		initialValues: initialValues || {
			kind: 'manual',
			operatingMode: OPERATING_MODE.INCLUDE,
			periodIds: [],
			timePoints: [],
			weekdays: [],
		},
		mode: 'controlled',
		validate: zodResolver(ManualRuleSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	//

	// Used to prevent calculations when timepoints change
	const periodKey = form.values.periodIds.join('|');
	const weekdayKey = form.values.weekdays.join('|');

	const ruleSummary = useMemo(() => buildRuleSummary(form.values, {
		periods: periodsContext.data.raw,
	}),
	[periodKey, weekdayKey, form.values.operatingMode, periodsContext.data.raw]);

	const ruleImpact = useMemo(() => getManualRuleAffectedDates(
		form.values,
		{
			endDate: Dates.now('Europe/Lisbon').plus({ years: 1 }).js_date,
			periods: periodsContext.data.raw,
			startDate: new Date(),
		},
	), [periodKey, weekdayKey, form.values.operatingMode, periodsContext.data.raw]);

	//
	// D. Handle actions

	const handleSubmitRule = () => {
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
	};

	const handleDeleteRule = () => {
		if (onDelete) {
			onDelete();
			closeCreateRuleModal();
		}
	};

	//
	// E. Define context value

	const contextValue: RuleCreateContextState = useMemo(() => ({
		actions: {
			closeDrawer: () => setIsDrawerOpen(false),
			deleteRule: onDelete ? handleDeleteRule : undefined,
			openDrawer: () => setIsDrawerOpen(true),
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
		},
	}), [
		form,
		ruleImpact,
		ruleSummary,
		isDrawerOpen,
		periodsContext.data.raw,
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
