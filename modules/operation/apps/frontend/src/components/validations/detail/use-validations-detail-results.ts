'use client';

import { useFilterStateText, useSearch } from '@tmlmobilidade/ui';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getValidationsDetailResults, type ValidationsDetailResultsData, type ValidationsDetailResultSeverity } from './get-validations-detail-results';
import { translateValidationResult } from './translate-validation-result';
import { useValidationsDetailContext } from './ValidationsDetailForm.context';

/* * */

export type ValidationsDetailResultItem = ValidationsDetailResultsData['results'][number] & {
	description: string
	ruleId: string
};

export interface UseValidationsDetailResultsReturnType {
	actions: {
		search: (query: string) => void
		select: (id: string) => void
		toggleSeverity: (severity: ValidationsDetailResultSeverity) => void
	}
	data: {
		results: ValidationsDetailResultItem[]
		selected: undefined | ValidationsDetailResultItem
		totals: ValidationsDetailResultsData['totals']
	}
	filters: {
		search: string
		severity: null | ValidationsDetailResultSeverity
	}
}

const SEARCH_ACCESSORS: (keyof ValidationsDetailResultItem)[] = ['description', 'ruleId'];

/* * */

export function useValidationsDetailResults(): UseValidationsDetailResultsReturnType {
	//

	//
	// A. Setup variables

	const { data: { validation } } = useValidationsDetailContext();
	const { i18n } = useTranslation('gtfs_validations');
	const search = useFilterStateText('validationRuleSearch');
	const severityFilter = useFilterStateText('validationRuleSeverity');
	const [selectedId, setSelectedId] = useState<null | string>();
	const summary = validation?.summary;

	//
	// B. Transform data

	const severityValue = severityFilter.value;

	const severity = severityValue === 'error' || severityValue === 'warning' || severityValue === 'info' ? severityValue : null;

	const { results, totals } = useMemo(() => getValidationsDetailResults(summary, severity), [summary, severity]);

	const searchableResults = useMemo(() => results.map(({ id, result }) => ({
		description: translateValidationResult(i18n, 'description', result.rule_id, result.description_translation, result.description),
		id,
		result,
		ruleId: result.rule_id,
	})), [i18n, i18n.resolvedLanguage, results]);

	const filteredResults = useSearch({
		accessors: SEARCH_ACCESSORS,
		data: searchableResults,
		debounce: 150,
		query: search.value.trim(),
	});

	const selected = filteredResults.find(({ id }) => id === selectedId) ?? filteredResults[0];

	//
	// C. Handle actions

	const toggleSeverity = useCallback((value: ValidationsDetailResultSeverity) => {
		severityFilter.set(severity === value ? '' : value);
	}, [severity, severityFilter]);

	//
	// D. Return state

	return useMemo(() => ({
		actions: { search: search.set, select: setSelectedId, toggleSeverity },
		data: { results: filteredResults, selected, totals },
		filters: { search: search.value, severity },
	}), [filteredResults, search, selected, severity, toggleSeverity, totals]);

	//
}
