'use client';

import { type GtfsValidationRule, type GtfsValidatorRuleId, GtfsValidatorRuleIdValues, GtfsValidatorRuleSeveritySchema } from '@tmlmobilidade/go-types-gtfs-validator';
import { useSearch, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';
import { type AgenciesDetailValidationRule, type AgenciesDetailValidationRuleEntry } from './types';
import { useAgenciesDetailValidationRulesFilters } from './use-agencies-detail-validation-rules-filters';

/* * */

type UpdateRule = (rule?: AgenciesDetailValidationRule) => GtfsValidationRule | undefined;

interface AgenciesDetailValidationRulesContextState {
	actions: {
		selectRule: (ruleId: GtfsValidatorRuleId) => void
		setSearch: (value: string) => void
		setSeverityFilter: (value: null | string) => void
		updateRule: (ruleId: GtfsValidatorRuleId, update: UpdateRule) => void
	}
	data: {
		entries: AgenciesDetailValidationRuleEntry[]
		selectedEntry?: AgenciesDetailValidationRuleEntry
		selectedRule?: AgenciesDetailValidationRule
	}
	filters: ReturnType<typeof useAgenciesDetailValidationRulesFilters>
	flags: {
		can_edit: boolean
	}
}

const SEARCH_ACCESSORS: (keyof AgenciesDetailValidationRuleEntry)[] = ['ruleId'];
const AgenciesDetailValidationRulesContext = createContext<AgenciesDetailValidationRulesContextState | undefined>(undefined);

/* * */

export function useAgenciesDetailValidationRulesContext() {
	const context = useContext(AgenciesDetailValidationRulesContext);
	if (!context) throw new Error('Missing AgenciesDetailValidationRulesContextProvider');
	return context;
}

/* * */

export function AgenciesDetailValidationRulesContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { capabilities: { editEnabled }, form } = useAgenciesDetailFormContext();
	const rules = useStandardFormWatch({ control: form.control, name: 'plans.validation_rules' });
	const filters = useAgenciesDetailValidationRulesFilters();
	const { search: { set: setSearchFilter }, setSeverity } = filters;
	const [selectedId, setSelectedId] = useState<GtfsValidatorRuleId>();

	//
	// B. Transform data

	const rulesById = useMemo(() => new Map(rules?.map(rule => [rule.rule_id, rule])), [rules]);
	const entriesById = useMemo(() => new Map(GtfsValidatorRuleIdValues.map((ruleId) => {
		const severity = GtfsValidatorRuleSeveritySchema.safeParse(rulesById.get(ruleId)?.severity).data;
		return [ruleId, { ruleId, severity }];
	})), [rulesById]);
	const entries = useMemo(() => [...entriesById.values()].filter(entry => (
		filters.severity === null || (entry.severity ?? 'unconfigured') === filters.severity
	)), [entriesById, filters.severity]);
	const matchingEntries = useSearch({ accessors: SEARCH_ACCESSORS, data: entries, debounce: 0, query: filters.search.value.trim() });
	const selectedEntry = selectedId ? entriesById.get(selectedId) : matchingEntries[0];
	const selectedRule = selectedEntry && rulesById.get(selectedEntry.ruleId);

	//
	// C. Handle actions

	const setSearch = useCallback((value: string) => {
		setSelectedId(undefined);
		setSearchFilter(value);
	}, [setSearchFilter]);

	const setSeverityFilter = useCallback((value: null | string) => {
		setSelectedId(undefined);
		setSeverity(value ?? '');
	}, [setSeverity]);

	const updateRule = useCallback((ruleId: GtfsValidatorRuleId, update: UpdateRule) => {
		if (!editEnabled) return;
		const currentRules = form.getValues('plans.validation_rules') ?? [];
		const index = currentRules.findIndex(rule => rule.rule_id === ruleId);
		const rule = update(currentRules[index]);
		if (!rule) return;
		setSelectedId(ruleId);
		const nextRules = index === -1 ? [...currentRules, rule] : currentRules.with(index, rule);
		form.setValue('plans.validation_rules', nextRules, { shouldDirty: true, shouldValidate: true });
	}, [editEnabled, form]);

	//
	// D. Return state

	const value = useMemo<AgenciesDetailValidationRulesContextState>(() => ({
		actions: { selectRule: setSelectedId, setSearch, setSeverityFilter, updateRule },
		data: { entries: matchingEntries, selectedEntry, selectedRule },
		filters,
		flags: { can_edit: editEnabled },
	}), [editEnabled, filters, matchingEntries, selectedEntry, selectedRule, setSearch, setSeverityFilter, updateRule]);

	return <AgenciesDetailValidationRulesContext.Provider value={value}>{children}</AgenciesDetailValidationRulesContext.Provider>;
}
