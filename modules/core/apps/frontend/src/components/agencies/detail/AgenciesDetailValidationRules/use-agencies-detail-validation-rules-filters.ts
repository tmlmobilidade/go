'use client';

import { type GtfsValidationRuleSeverity, GtfsValidatorRuleSeveritySchema, GtfsValidatorRuleSeverityValues } from '@tmlmobilidade/go-types-gtfs-validator';
import { type SelectDataItem, useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

type SeverityFilter = 'unconfigured' | GtfsValidationRuleSeverity;

interface UseAgenciesDetailValidationRulesFiltersReturnType {
	configuredSeverityOptions: SelectDataItem[]
	getSeverityLabel: (value: SeverityFilter) => string
	search: UseFilterStateTextReturnType
	setSeverity: (value: string) => void
	severity: null | SeverityFilter
	severityOptions: SelectDataItem[]
}

/* * */

export function useAgenciesDetailValidationRulesFilters(): UseAgenciesDetailValidationRulesFiltersReturnType {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const search = useFilterStateText('validation-rules-search');
	const severityFilter = useFilterStateText('validation-rules-severity');

	//
	// B. Transform data

	return useMemo(() => {
		const getSeverityLabel = (value: SeverityFilter) => t(`agencies:detail.AgenciesDetailValidationRuleSeverity.levels.${value}`);
		const configuredSeverityOptions = GtfsValidatorRuleSeverityValues.map(value => ({ label: getSeverityLabel(value), value }));
		const parsedSeverity = GtfsValidatorRuleSeveritySchema.safeParse(severityFilter.value);

		return {
			configuredSeverityOptions,
			getSeverityLabel,
			search,
			setSeverity: severityFilter.set,
			severity: severityFilter.value === 'unconfigured' ? 'unconfigured' : parsedSeverity.data ?? null,
			severityOptions: [...configuredSeverityOptions, { label: getSeverityLabel('unconfigured'), value: 'unconfigured' }],
		};
	}, [search, severityFilter, t]);
}
