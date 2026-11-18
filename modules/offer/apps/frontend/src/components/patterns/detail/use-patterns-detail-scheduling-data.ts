'use client';

import { type StopsParameterExtended } from '@/utils/stops-parameters';
import { type PatternsDetailFormDto, type PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { type Event, type EventReplacementRule, type EventRestrictionRule, type ScheduleRule, type StopsParameter, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { buildParameterSummary, buildRuleSummary, computeSegmentTravelTimes, getMergedPath } from '@tmlmobilidade/go-utils-offer';
import { useLocaleContext, type useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface UsePatternsDetailSchedulingDataOptions {
	derivedRules: (EventReplacementRule | EventRestrictionRule)[]
	editablePath: PatternsDetailPathItem[]
	events: Event[]
	periods: YearPeriod[]
	values: ReturnType<typeof useStandardFormWatch<PatternsDetailFormDto>>
}

interface UsePatternsDetailSchedulingDataReturnType {
	parametersForUI: StopsParameterExtended[]
	rulesForUI: ScheduleRule[]
}

/* * */

/**
 * Combine writable manual rules with API-derived Event rules for display/preview only.
 * Localized labels and calculated travel times must never become stored Pattern fields.
 */
export function usePatternsDetailSchedulingData({ derivedRules, editablePath, events, periods, values }: UsePatternsDetailSchedulingDataOptions): UsePatternsDetailSchedulingDataReturnType {
	//
	// A. Setup display locale

	const { t } = useTranslation();
	const { data: { locale } } = useLocaleContext();

	//
	// B. Derive scheduling labels and travel times

	// rules used for UI + preview
	const rulesForUI = useMemo(
		() => {
			const allRules = [...(values.rules ?? []), ...derivedRules] as ScheduleRule[];

			// Derive the compact rule label and event details for display
			return allRules.map((rule) => {
				const { label, tooltip } = buildRuleSummary(rule, { events: events, locale, periods, t });
				return { ...rule, name: label, tooltip };
			});
		},
		[events, values.rules, derivedRules, periods, locale, t],
	);

	// parameters used for UI + preview
	const parametersForUI = useMemo(() => {
		const allParameters = [...(values.parameters ?? [])] as StopsParameter[];
		const basePath = editablePath;

		return allParameters.map((parameter) => {
			const { long, short } = buildParameterSummary(parameter, { locale, periods, t });

			const mergedPath = getMergedPath(basePath, parameter.path || []);
			const parameterTravelTimes = computeSegmentTravelTimes(mergedPath);

			return {
				...parameter,
				name: long,
				shortName: short,
				travelTimes: parameterTravelTimes,
			};
		});
	}, [values.parameters, periods, editablePath, locale, t]);

	//
	// C. Return display data

	return useMemo(() => ({ parametersForUI, rulesForUI }), [parametersForUI, rulesForUI]);
}
