'use client';

/* * */

import { usePeriodsContext } from '@/contexts/Periods.context';
import { computeRuleImpact } from '@/utils/rules/ruleAppliesToDate';
import { buildRuleSummary } from '@/utils/rules/ruleSummary';
import { useForm } from '@mantine/form';
import { Dates } from '@tmlmobilidade/dates';
import { OPERATING_MODE, ScheduleRule, ScheduleRuleSchema } from '@tmlmobilidade/types';
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
		form: UseFormReturnType<ScheduleRule>
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

export const RuleCreateContextProvider = ({ children, initialValues, onDelete, onSubmit }: PropsWithChildren<{ initialValues?: ScheduleRule, onDelete?: () => void, onSubmit: (rule: ScheduleRule) => void }>) => {
	//

	//
	// A. Setup variables

	const periodsContext = usePeriodsContext();
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	//
	// B. Fetch data

	//
	// C. Setup form

	const form = useForm<ScheduleRule>({
		initialValues: initialValues || {
			operatingMode: OPERATING_MODE.INCLUDE,
			periodIds: [],
			timePoints: [],
		},
		mode: 'controlled',
		validate: zodResolver(ScheduleRuleSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	//

	const ruleSummary = useMemo(() => buildRuleSummary(form.values, {
		periods: periodsContext.data.periods,
	}), [form.values, periodsContext.data.periods]);

	const ruleImpact = useMemo(() => computeRuleImpact(
		form.values,
		{
			endDate: Dates.now('Europe/Lisbon').plus({ years: 1 }).js_date,
			events: new Set(),
			holidays: new Set(),
			periods: periodsContext.data.periods,
			startDate: new Date(),
		},
	), [form.values, periodsContext.data.periods]);

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
