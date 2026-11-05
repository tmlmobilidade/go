import type { DayContext } from '../calculation/types.js';
import type { GtfsIncludeContribution } from './types.js';

import { calendarWeekday } from '@/scheduling-calendar.js';
import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { type Event, type EventReplacementRule, type HHMM, hhmm, type ManualRule, type ScheduleRule, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { calendarKey, Dates } from '@tmlmobilidade/go-utils-dates';

import { computeActiveRules } from '../calculation/index.js';
import { getActivePeriodId } from '../utils/date.js';
import { shouldEmitReplacementOnForcedRetarget } from './canonical-registry.js';
import { collectReplacementManualIncludesByRule } from './collectors.js';
import { compareGeneralManualOwnershipPriority } from './manual-ownership.js';
import { collectNormalDayContributions } from './normal-day-contributions.js';
import { isForcedRetargetDay, resolveEffectiveReplacement } from './replacement.js';

/* * */

/**
 * Replacement days: bind GTFS tokens using {@link computeActiveRules} as operating truth.
 *
 * **Forced retarget** — operating TPs on the replacement rule (+ `base_off` on calendar base owners);
 * calendar-only TPs get `base_off` when absent from the operating set (FR-02, FR-03).
 * Skips the replacement row when calendar manuals already cover the full operating set (FR-04).
 *
 * **Same_weekday** — `operating` rows on calendar manual owners (ND-03), one row per timepoint.
 */
export function collectReplacementDayContributions(
	date: OperationalDateInt,
	replacement: EventReplacementRule,
	allRules: ScheduleRule[],
	monthFilteredManualRules: ManualRule[],
	periods: YearPeriod[],
	holidays: Holiday[],
	events?: Event[],
): GtfsIncludeContribution[] {
	const contributions: GtfsIncludeContribution[] = [];
	const effectiveReplacement = resolveEffectiveReplacement(date, replacement, holidays);
	const operating = computeActiveRules(date, allRules, periods, holidays, { events });
	const operatingTimepoints = new Set(operating.timepoints.map(tp => hhmm(tp)));

	const replacementAsRule = allRules.find(r => r._id === replacement._id) ?? replacement;
	const forcedRetarget = isForcedRetargetDay(date, effectiveReplacement, holidays);

	const key = calendarKey(Dates.fromOperationalDateInt(date, 'Europe/Lisbon'));
	const calendarCtx: DayContext = {
		weekday: calendarWeekday(key, holidays),
		yearPeriodId: getActivePeriodId(date, periods),
	};
	const calendarContributions = collectNormalDayContributions(monthFilteredManualRules, calendarCtx);
	const calendarOperatingByTimepoint = new Map<HHMM, ScheduleRule>();
	for (const contribution of calendarContributions) {
		if (contribution.kind !== 'operating') continue;
		calendarOperatingByTimepoint.set(contribution.timepoint, contribution.rule);
	}

	if (forcedRetarget) {
		const emitReplacement = shouldEmitReplacementOnForcedRetarget(
			operatingTimepoints,
			calendarOperatingByTimepoint,
		);

		for (const timepoint of operatingTimepoints) {
			const ownerRule = calendarOperatingByTimepoint.get(timepoint);

			if (emitReplacement) {
				contributions.push({ kind: 'operating', rule: replacementAsRule, timepoint });
				// Shared timepoint (FR-03): replacement runs on the event date; base is OFF, not plain.
				if (ownerRule) {
					contributions.push({
						excludeRule: replacementAsRule,
						kind: 'base_off',
						rule: ownerRule,
						timepoint,
					});
				}
				continue;
			}

			if (ownerRule) {
				contributions.push({ kind: 'operating', rule: ownerRule, timepoint });
			}
		}

		// Weekday-owned timepoints that are not in the replacement operating set (e.g. 06:40
		// when Carnival runs Saturday times from 06:45) → BASE-OFF-replacement on event dates.
		for (const [timepoint, ownerRule] of calendarOperatingByTimepoint) {
			if (operatingTimepoints.has(timepoint)) continue;

			contributions.push({
				excludeRule: replacementAsRule,
				kind: 'base_off',
				rule: ownerRule,
				timepoint,
			});
		}
	} else {
		// same_weekday (SW-01): one operating owner per timepoint (ND-03), not every rule that
		// intersects the replacement — e.g. ALL_DU + ALL_DU-SAB both match but only ALL_DU owns 21:00.
		for (const timepoint of operatingTimepoints) {
			let ownerRule = calendarOperatingByTimepoint.get(timepoint);

			if (!ownerRule) {
				const candidates = collectReplacementManualIncludesByRule(effectiveReplacement, monthFilteredManualRules)
					.filter(({ timepoints }) => timepoints.some(tp => hhmm(tp) === timepoint))
					.sort((a, b) => compareGeneralManualOwnershipPriority(a.rule, b.rule));

				ownerRule = candidates[0]?.rule;
			}

			if (ownerRule) {
				contributions.push({ kind: 'operating', rule: ownerRule, timepoint });
			}
		}
	}

	return contributions;
}

