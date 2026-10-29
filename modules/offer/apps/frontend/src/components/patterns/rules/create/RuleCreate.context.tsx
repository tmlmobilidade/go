'use client';

import { useEventsContext } from '@/contexts/Events.context';
import { useHolidaysContext } from '@/contexts/Holidays.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { ManualRule, ManualRuleSchema } from '@tmlmobilidade/go-types-offer';
import { CalendarDate, toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { buildRuleSummary, getManualRuleAffectedDates } from '@tmlmobilidade/go-utils-offer';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type StandardFormContextValue, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { closeCreateRuleModal } from './RuleCreate.modal';

/* * */

interface RuleCreateContextState extends StandardFormContextValue<ManualRule> {
	actions: StandardFormContextValue<ManualRule>['actions'] & {
		closeDrawer: () => void
		deleteRule?: () => void
		duplicateRule?: () => void
		openDrawer: () => void
		setEventExceptionEnabled: (enabled: boolean) => void
		setPreviewYear: (year: number) => void
		submitRule: () => void
	}
	data: {
		ruleImpact: null | {
			count: number
			dates: CalendarDate[]
		}
		ruleSummary: { long: string, short: string }
		values: ManualRule
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

	const [previewYear, setPreviewYear] = useState(Number(Dates.now('local').toFormat('yyyy')));

	//
	// B. Setup form

	const defaultValues = useMemo<ManualRule>(() => initialValues ?? {
		_id: generateRandomString({ length: 5 }),
		kind: 'manual',
		operating_mode: 'include',
		timepoints: [],
		weekdays: [],
		year_period_ids: [],
	}, [initialValues]);
	const { form, isDirty, isValid, unblock } = useStandardForm<ManualRule, typeof ManualRuleSchema>({
		defaultValues,
		schema: ManualRuleSchema,
	});
	const values = useStandardFormWatch({ compute: values => values, control: form.control });

	//
	// C. Transform data

	const ruleSummary = useMemo(() => buildRuleSummary(values, {
		events: eventsContext.data.raw,
		periods: periodsContext.data.raw,
	}),
	[eventsContext.data.raw, values, periodsContext.data.raw]);

	const ruleImpact = useMemo(() => {
		const startDate = toCalendarDate(`${previewYear}-01-01`);
		const endDate = toCalendarDate(`${previewYear}-12-31`);

		return getManualRuleAffectedDates(
			values,
			{
				endDate,
				events: eventsContext.data.raw,
				holidays: holidaysContext.data.raw,
				periods: periodsContext.data.raw,
				startDate,
			},
		);
	}, [eventsContext.data.raw, values, periodsContext.data.raw, holidaysContext.data.raw, previewYear]);

	//
	// D. Handle actions

	const handleSubmitRule = useCallback(async () => {
		await form.handleSubmit((data) => {
			// Names are preview metadata; the Pattern update contract strips them.
			onSubmit({ ...data, name: ruleSummary.long });
			unblock();
			closeCreateRuleModal();
		})();
	}, [form, onSubmit, ruleSummary.long, unblock]);

	const handleDeleteRule = useCallback(() => {
		if (onDelete) {
			onDelete();
			unblock();
			closeCreateRuleModal();
		}
	}, [onDelete, unblock]);

	const handleDuplicateRule = useCallback(async () => {
		if (!onDuplicate) return;
		await form.handleSubmit((data) => {
			onDuplicate({ ...data, name: ruleSummary.long });
			unblock();
			closeCreateRuleModal();
		})();
	}, [form, onDuplicate, ruleSummary.long, unblock]);

	//
	// E. Define context value

	const capabilities = useStandardFormCapabilities({
		create: { hasPermission: true },
		form: { isDirty, isValid },
	});

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
		capabilities,
		data: {
			ruleImpact,
			ruleSummary,
			values,
		},
		flags: {
			isDrawerOpen,
			isEditing: Boolean(initialValues),
			isEventExceptionEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {},
		unblock,
	}), [
		form,
		capabilities,
		isDirty,
		isValid,
		unblock,
		values,
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
	// F. Render components

	return (
		<RuleCreateContext.Provider value={contextValue}>
			{children}
		</RuleCreateContext.Provider>
	);

	//
};
