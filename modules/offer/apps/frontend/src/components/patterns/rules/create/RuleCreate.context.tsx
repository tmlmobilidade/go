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
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface RuleCreateContextState {
	actions: {
		create: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<ScheduleRule>
		ruleImpact: {
			count: number
			dates: string[]
		}
		ruleSummary: string
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

export const RuleCreateContextProvider = ({ children, initialValues, onSuccess, patternId, ruleIndex }: PropsWithChildren<{ initialValues?: ScheduleRule, onSuccess?: (rule: ScheduleRule, index?: number) => void, patternId?: string, ruleIndex?: number }>) => {
	//

	//
	// A. Setup variables

	const periodsContext = usePeriodsContext();

	//
	// B. Fetch data

	//
	// C. Setup form

	const form = useForm<ScheduleRule>({
		initialValues: initialValues || {
			operatingMode: OPERATING_MODE.INCLUDE,
			periodIds: [],
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

	const handleCreate = async () => {
		// Validate form
		const validation = form.validate();
		if (validation.hasErrors) {
			return;
		}

		// Get the rule values and add the generated name
		const ruleValues = {
			...form.getValues(),
			name: ruleSummary,
		};

		// Call the onSuccess callback to add or update the rule
		if (onSuccess) {
			onSuccess(ruleValues, ruleIndex);
		}
	};

	//
	// E. Define context value

	const contextValue: RuleCreateContextState = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		data: {
			form,
			ruleImpact,
			ruleSummary,
		},
	}), [
		form,
		ruleImpact,
		ruleSummary,
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
