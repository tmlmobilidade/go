'use client';

import { openEventsRulesCreateModal } from '@/components/events/rules/EventsRulesCreate.modal';
import { type EventRule, type Line } from '@tmlmobilidade/go-types-offer';
import { generateRandomString } from '@tmlmobilidade/strings';
import { useStandardFormWatch } from '@tmlmobilidade/ui';
import { useCallback, useMemo } from 'react';

import { useEventsLinesData } from '../shared/use-events-lines-data';
import { useEventsDetailFormContext } from './EventsDetailForm.context';

/* * */

interface UseEventsDetailRulesReturnType {
	addRule: (rule: EventRule) => void
	deleteRule: (ruleId: string) => void
	editRule: (rule: EventRule) => void
	lines: Line[]
	openRuleModal: (rule?: EventRule) => void
	rules: EventRule[]
}

/**
 * Hook to manage the rules of the event being edited.
 * The rules live in the detail form; this hook exposes the actions to change them.
 * @returns The rules, the lines of the event agencies and the rule actions.
 */
export function useEventsDetailRules(): UseEventsDetailRulesReturnType {
	//

	//
	// A. Setup variables

	const { form } = useEventsDetailFormContext();

	const { data: allLinesData } = useEventsLinesData();

	const agencyIdsValue = useStandardFormWatch({ control: form.control, name: 'agency_ids' });
	const datesValue = useStandardFormWatch({ control: form.control, name: 'dates' });
	const rulesValue = useStandardFormWatch({ control: form.control, name: 'rules' });

	//
	// B. Transform data

	const rules = useMemo(() => rulesValue ?? [], [rulesValue]);

	const lines = useMemo(() => {
		// Skip if the event has no agencies
		if (!agencyIdsValue?.length) return [];
		// Keep only the lines of the event agencies
		const agencyIdsSet = new Set(agencyIdsValue);
		return allLinesData.filter(line => agencyIdsSet.has(line.agency_id));
	}, [agencyIdsValue, allLinesData]);

	//
	// C. Handle actions

	const setRules = useCallback((newRules: EventRule[]) => {
		form.setValue('rules', newRules, { shouldDirty: true, shouldValidate: true });
	}, [form]);

	const addRule = useCallback((rule: EventRule) => {
		const currentRules = form.getValues('rules') ?? [];
		setRules([...currentRules, { ...rule, _id: generateRandomString({ length: 5 }) }]);
	}, [form, setRules]);

	const editRule = useCallback((rule: EventRule) => {
		if (!rule._id) return;
		const currentRules = form.getValues('rules') ?? [];
		setRules(currentRules.map(item => (item._id === rule._id ? rule : item)));
	}, [form, setRules]);

	const deleteRule = useCallback((ruleId: string) => {
		const currentRules = form.getValues('rules') ?? [];
		setRules(currentRules.filter(item => item._id !== ruleId));
	}, [form, setRules]);

	const openRuleModal = useCallback((rule?: EventRule) => {
		const ruleId = rule?._id;
		openEventsRulesCreateModal({
			eventData: {
				agency_ids: agencyIdsValue ?? [],
				dates: datesValue ?? [],
			},
			initialValues: rule,
			onDelete: ruleId ? () => deleteRule(ruleId) : undefined,
			onSubmit: validatedRule => (ruleId ? editRule({ ...validatedRule, _id: ruleId }) : addRule(validatedRule)),
		});
	}, [addRule, agencyIdsValue, datesValue, deleteRule, editRule]);

	//
	// D. Return data

	return useMemo(() => ({
		addRule,
		deleteRule,
		editRule,
		lines,
		openRuleModal,
		rules,
	}), [addRule, deleteRule, editRule, lines, openRuleModal, rules]);
}
