import { type GtfsV29ExportConfig } from '@/types.js';
import { type ServiceId, type ServiceRegistry } from '@/utils/service-registry.js';
import {
	buildRuleSummaryGtfs,
	calendarWeekday,
	computeActiveRules,
	Dates,
	getActivePeriodId,
	resolveDayPeriod,
	resolvePatternRules,
	yyyymmddToKey,
} from '@tmlmobilidade/dates';
import {
	DayPeriod,
	type Event,
	GtfsBikesAllowed,
	GtfsTMLTrip,
	GtfsWheelchairBoarding,
	type HHMM,
	hhmm,
	type Holiday,
	type IsoWeekday,
	type OperationalDate,
	type Pattern,
	patternDirectionMapper,
	type Route,
	ScheduleRule,
	timeToMinutes,
	type YearPeriod,
} from '@tmlmobilidade/types';

/* * */

type ScheduleContributionMode = 'exclude' | 'include';

interface RuleTimepointSchedule {
	dates: Set<OperationalDate>
	mode: ScheduleContributionMode
	rule: ScheduleRule
	timepoint: HHMM
}

interface ResolvedTripRow {
	dates: Set<OperationalDate>
	ruleToken: string
	serviceId: ServiceId
	timepoint: HHMM
}

export interface TripSchedule {
	day_period: DayPeriod
	period_ids: string[]
	serviceId: ServiceId
	timepoint: HHMM
	trip_id: string
	weekdays: IsoWeekday[]
}

/* * */

// Abstract this

function isTimeInRange(time: HHMM, start: HHMM, end: HHMM): boolean {
	const timeMinutes = timeToMinutes(time);
	const startMinutes = timeToMinutes(start);
	const endMinutes = timeToMinutes(end);

	return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

function addScheduleDate(
	schedules: Map<string, RuleTimepointSchedule>,
	args: {
		date: OperationalDate
		mode: ScheduleContributionMode
		rule: ScheduleRule
		timepoint: HHMM
	},
) {
	const scheduleKey = `${args.rule._id}|${args.mode}|${args.timepoint}`;

	if (!schedules.has(scheduleKey)) {
		schedules.set(scheduleKey, {
			dates: new Set<OperationalDate>(),
			mode: args.mode,
			rule: args.rule,
			timepoint: args.timepoint,
		});
	}

	schedules.get(scheduleKey)?.dates.add(args.date);
}

function buildTimepointSchedules(
	allRules: ScheduleRule[],
	periods: YearPeriod[],
	holidays: Holiday[],
	events: Event[],
	startDate: Dates,
	endDate: Dates,
): Map<string, RuleTimepointSchedule> {
	const schedules = new Map<string, RuleTimepointSchedule>();
	const rulesById = new Map(allRules.map(rule => [rule._id, rule]));

	let currentDate = startDate;

	while (currentDate.unix_timestamp <= endDate.unix_timestamp) {
		const operationalDate = currentDate.operational_date;

		// 1) Resolve which rules are active on this date.
		const appliedRules = getAppliedRulesForDate(
			operationalDate,
			allRules,
			periods,
			holidays,
			events,
			rulesById,
		);

		// 2) Build ON buckets:
		// - if replacement rules are active, attribute only the timepoints
		//   newly introduced by each replacement rule
		// - otherwise attribute ON buckets to active manual include rules
		const activeIncludeTimepoints = collectIncludeTimepointsForDate(
			schedules,
			operationalDate,
			appliedRules,
			allRules,
			periods,
			holidays,
			events,
		);

		// 3) Build OFF buckets from:
		// - manual exclude rules (explicit timepoints)
		// - event restriction rules (affect active include timepoints in scope)
		collectExcludeTimepointsForDate(
			schedules,
			operationalDate,
			appliedRules,
			activeIncludeTimepoints,
		);

		currentDate = currentDate.plus({ days: 1 });
	}

	return schedules;
}

function getAppliedRulesForDate(
	operationalDate: OperationalDate,
	allRules: ScheduleRule[],
	periods: YearPeriod[],
	holidays: Holiday[],
	events: Event[],
	rulesById: Map<string | undefined, ScheduleRule>,
): ScheduleRule[] {
	const { appliedRuleIds } = computeActiveRules(
		operationalDate,
		allRules,
		periods,
		holidays,
		{ events },
	);

	return appliedRuleIds
		.map(id => rulesById.get(id))
		.filter((rule): rule is ScheduleRule => !!rule);
}

/**
 * Computes the manual include rules that would apply on a given date
 * WITHOUT any event replacement rules in effect.
 * Used to correctly attribute non-replacement timepoints to their original
 * weekday/weekend rules instead of the replacement-context rules.
 */
function getBaseManualIncludeRules(
	operationalDate: OperationalDate,
	allRules: ScheduleRule[],
	periods: YearPeriod[],
	holidays: Holiday[],
	events: Event[],
): ScheduleRule[] {
	const baseRules = allRules.filter(r => r.kind !== 'event_replacement');
	const baseRulesById = new Map<string | undefined, ScheduleRule>(baseRules.map(r => [r._id, r]));
	const { appliedRuleIds } = computeActiveRules(operationalDate, baseRules, periods, holidays, { events });
	const result: ScheduleRule[] = [];
	for (const id of appliedRuleIds) {
		const rule = baseRulesById.get(id);
		if (rule?.kind === 'manual' && rule.operating_mode === 'include') {
			result.push(rule);
		}
	}
	return result;
}

function collectIncludeTimepointsForDate(
	schedules: Map<string, RuleTimepointSchedule>,
	operationalDate: OperationalDate,
	appliedRules: ScheduleRule[],
	allRules: ScheduleRule[],
	periods: YearPeriod[],
	holidays: Holiday[],
	events: Event[],
): Set<HHMM> {
	const activeIncludeTimepoints = new Set<HHMM>();

	const activeManualIncludeRules = appliedRules.filter(
		(rule): rule is ScheduleRule =>
			rule.kind === 'manual' && rule.operating_mode === 'include',
	);

	const activeReplacementRules = appliedRules.filter(
		(rule): rule is ScheduleRule => rule.kind === 'event_replacement',
	);

	// When a replacement rule is active, it should only "own" the timepoints
	// that it actually adds compared to the same date without that replacement rule.
	if (activeReplacementRules.length > 0) {
		for (const replacementRule of activeReplacementRules) {
			const addedTimepoints = getReplacementAddedTimepoints(
				operationalDate,
				replacementRule,
				allRules,
				periods,
				holidays,
				events,
			);

			for (const timepoint of addedTimepoints) {
				if (activeIncludeTimepoints.has(timepoint)) continue;

				activeIncludeTimepoints.add(timepoint);

				addScheduleDate(schedules, {
					date: operationalDate,
					mode: 'include',
					rule: replacementRule,
					timepoint,
				});
			}
		}
	}

	// ON buckets from manual include rules.
	// When replacements are active, the replacement-context applied rules are Saturday/event
	// rules — NOT the original weekday rules. Using those would wrongly attribute non-added
	// timepoints (e.g. 14:50 that already exists on weekdays) to Saturday calendars.
	// Fix: when any replacement is active, compute the BASE context (no replacements) so that
	// non-added timepoints are attributed to their original weekday/weekend rule, keeping
	// calendars like ALL_DU or ESC_DU correct. Timepoints already claimed by the replacement
	// are skipped via the `activeIncludeTimepoints.has` guard.
	const manualIncludeRules: ScheduleRule[] = activeReplacementRules.length > 0
		? getBaseManualIncludeRules(operationalDate, allRules, periods, holidays, events)
		: activeManualIncludeRules;

	// Two-pass approach: event-specific rules (event_id set) win over general rules.
	// When a general rule loses a timepoint to an event-specific rule, record an
	// artificial include+exclude pair so resolveTripRows can emit the -OFF- suffix.
	const timepointOwners = new Map<HHMM, ScheduleRule>();

	// Pass 1: event-specific manual include rules (have event_id) — higher priority
	const eventSpecificIncludes = manualIncludeRules.filter(r => !!(r as { event_id?: string }).event_id);

	for (const manualRule of eventSpecificIncludes) {
		for (const rawTimepoint of manualRule.timepoints ?? []) {
			const timepoint = hhmm(rawTimepoint);

			if (activeIncludeTimepoints.has(timepoint)) continue;

			activeIncludeTimepoints.add(timepoint);
			timepointOwners.set(timepoint, manualRule);

			addScheduleDate(schedules, { date: operationalDate, mode: 'include', rule: manualRule, timepoint });
		}
	}

	// Pass 2: general manual include rules (no event_id) — lower priority.
	// If a timepoint was already claimed in pass 1 by an event-specific rule, record
	// the displacement so the general rule's token gains -OFF-<EventName>.
	const generalIncludes = manualIncludeRules.filter(r => !(r as { event_id?: string }).event_id);

	for (const manualRule of generalIncludes) {
		for (const rawTimepoint of manualRule.timepoints ?? []) {
			const timepoint = hhmm(rawTimepoint);

			if (activeIncludeTimepoints.has(timepoint)) {
				const ownerRule = timepointOwners.get(timepoint);

				if (ownerRule) {
					// Displaced by event-specific rule: record both sides for token building.
					addScheduleDate(schedules, { date: operationalDate, mode: 'include', rule: manualRule, timepoint });
					addScheduleDate(schedules, { date: operationalDate, mode: 'exclude', rule: ownerRule, timepoint });
				}

				continue;
			}

			activeIncludeTimepoints.add(timepoint);
			timepointOwners.set(timepoint, manualRule);

			addScheduleDate(schedules, { date: operationalDate, mode: 'include', rule: manualRule, timepoint });
		}
	}

	return activeIncludeTimepoints;
}

function getReplacementAddedTimepoints(
	operationalDate: OperationalDate,
	replacementRule: ScheduleRule,
	allRules: ScheduleRule[],
	periods: YearPeriod[],
	holidays: Holiday[],
	events: Event[],
): Set<HHMM> {
	const withRule = computeActiveRules(
		operationalDate,
		allRules,
		periods,
		holidays,
		{ events },
	);

	const withoutRule = computeActiveRules(
		operationalDate,
		allRules.filter(r => r._id !== replacementRule._id),
		periods,
		holidays,
		{ events },
	);

	const withSet = new Set(withRule.timepoints);
	const withoutSet = new Set(withoutRule.timepoints);
	const addedTimepoints = new Set<HHMM>();

	for (const tp of withSet) {
		if (!withoutSet.has(tp)) {
			addedTimepoints.add(hhmm(tp));
		}
	}

	return addedTimepoints;
}

function collectExcludeTimepointsForDate(
	schedules: Map<string, RuleTimepointSchedule>,
	operationalDate: OperationalDate,
	appliedRules: ScheduleRule[],
	activeIncludeTimepoints: Set<HHMM>,
) {
	for (const rule of appliedRules) {
		// Manual exclude rules explicitly remove their own timepoints.
		if (rule.kind === 'manual' && rule.operating_mode === 'exclude') {
			for (const rawTimepoint of rule.timepoints ?? []) {
				addScheduleDate(schedules, {
					date: operationalDate,
					mode: 'exclude',
					rule,
					timepoint: hhmm(rawTimepoint),
				});
			}

			continue;
		}

		// Event restriction rules remove whichever active include timepoints
		// fall inside the restricted window for this date.
		if (rule.kind === 'event_restriction') {
			for (const timepoint of activeIncludeTimepoints) {
				const affectsTimepoint = rule.all_day
					? true
					: !!rule.start_time && !!rule.end_time && isTimeInRange(timepoint, rule.start_time, rule.end_time);

				if (!affectsTimepoint) continue;

				addScheduleDate(schedules, {
					date: operationalDate,
					mode: 'exclude',
					rule,
					timepoint,
				});
			}
		}
	}
}

/**
 * Converts a timepoint (HH:mm) to minutes since operational day start (04:00).
 * Times before 04:00 are considered part of the previous operational day.
 */
function timepointToOperationalMinutes(timepoint: HHMM): number {
	const [hours, minutes] = timepoint.split(':').map(Number);
	let totalMinutes = hours * 60 + minutes;

	if (totalMinutes < 240) {
		totalMinutes += 24 * 60;
	}

	return totalMinutes;
}

/**
 * Groups raw schedules by timepoint.
 */
function groupSchedulesByTimepoint(
	schedules: Map<string, RuleTimepointSchedule>,
): Map<HHMM, RuleTimepointSchedule[]> {
	const grouped = new Map<HHMM, RuleTimepointSchedule[]>();

	for (const schedule of schedules.values()) {
		if (!grouped.has(schedule.timepoint)) {
			grouped.set(schedule.timepoint, []);
		}

		grouped.get(schedule.timepoint)?.push(schedule);
	}

	return grouped;
}

/**
 * Post-processing pass: removes include schedules whose date set is a strict subset of
 * another include schedule for the same timepoint.
 *
 * When rule A covers only weekdays and rule B covers all days (weekdays + weekend),
 * at the same timepoint, A is redundant — B already owns all of A's dates.
 * Without this pass the displacement logic produces:
 *   - A on weekdays (clean)
 *   - B-OFF-A on weekends only (messy, ends up sharing a serviceId with other SAB-DOM patterns)
 * With this pass A is absorbed into B, yielding:
 *   - B on all dates (clean)
 *
 * Also removes the paired exclude record created by the displacement logic
 * (`${A.rule._id}|exclude|${timepoint}`) so B's date set is not incorrectly subtracted.
 */
function mergeSubsetIncludeSchedules(schedules: Map<string, RuleTimepointSchedule>): void {
	// Index include schedules by timepoint
	const includesByTimepoint = new Map<HHMM, RuleTimepointSchedule[]>();

	for (const schedule of schedules.values()) {
		if (schedule.mode !== 'include') continue;

		if (!includesByTimepoint.has(schedule.timepoint)) {
			includesByTimepoint.set(schedule.timepoint, []);
		}

		includesByTimepoint.get(schedule.timepoint).push(schedule);
	}

	const keysToDelete = new Set<string>();

	for (const includes of includesByTimepoint.values()) {
		if (includes.length < 2) continue;

		for (const a of includes) {
			// A is dominated if there exists B with a.dates ⊊ b.dates (strict subset).
			const isDominated = includes.some(b => b.rule._id !== a.rule._id && b.dates.size > a.dates.size && [...a.dates].every(d => b.dates.has(d)));

			if (isDominated) {
				keysToDelete.add(`${a.rule._id}|include|${a.timepoint}`);
				// Remove the displacement-exclude record too — it was only subtracting
				// A's dates from B's include, which we no longer need.
				keysToDelete.add(`${a.rule._id}|exclude|${a.timepoint}`);
			}
		}
	}

	for (const key of keysToDelete) {
		schedules.delete(key);
	}
}

/**
 * Resolves final exportable trip rows.
 *
 * Final semantics:
 * - one row per include rule + timepoint
 * - if any exclude rules overlap this include rule on this timepoint,
 *   the token becomes INCLUDE-OFF-ex1-ex2
 * - the service dates are include dates MINUS all overlapping exclude dates
 * - no second plain INCLUDE row is created
 * - if resulting dates are empty, skip the row
 */
function resolveTripRows(
	schedules: Map<string, RuleTimepointSchedule>,
	serviceRegistry: ServiceRegistry,
	{ events, periods }: { events: Event[], periods: YearPeriod[] },
): ResolvedTripRow[] {
	const groupedByTimepoint = groupSchedulesByTimepoint(schedules);
	const resolvedRows: ResolvedTripRow[] = [];

	for (const [timepoint, timepointSchedules] of groupedByTimepoint.entries()) {
		const includeSchedules = timepointSchedules.filter(schedule => schedule.mode === 'include');
		const excludeSchedules = timepointSchedules.filter(schedule => schedule.mode === 'exclude');

		for (const includeSchedule of includeSchedules) {
			const overlappingExcludeSchedules = excludeSchedules.filter((excludeSchedule) => {
				// A rule cannot exclude itself: displacement records write an exclude attributed
				// to the winning event-specific rule, which would otherwise corrupt its own token.
				if (excludeSchedule.rule._id === includeSchedule.rule._id) return false;
				for (const date of includeSchedule.dates) {
					if (excludeSchedule.dates.has(date)) return true;
				}
				return false;
			});

			const resultingDates = new Set<OperationalDate>(includeSchedule.dates);

			for (const excludeSchedule of overlappingExcludeSchedules) {
				for (const excludedDate of excludeSchedule.dates) {
					resultingDates.delete(excludedDate);
				}
			}

			if (resultingDates.size === 0) {
				continue;
			}

			const includeRuleName = buildRuleSummaryGtfs(includeSchedule.rule, { events, periods });
			const excludeRuleNames = [...new Set(overlappingExcludeSchedules.map(s => buildRuleSummaryGtfs(s.rule, { events, periods })))].sort();

			const ruleToken = excludeRuleNames.length > 0
				? `${includeRuleName}-OFF-${excludeRuleNames.join('-')}`
				: includeRuleName;

			const hashServiceId = serviceRegistry.getOrCreateServiceId(resultingDates);
			const resolvedRuleToken = serviceRegistry.resolveRuleToken(ruleToken, hashServiceId);
			serviceRegistry.registerServiceId(resolvedRuleToken, resultingDates);

			resolvedRows.push({
				dates: resultingDates,
				ruleToken: resolvedRuleToken,
				serviceId: resolvedRuleToken,
				timepoint,
			});
		}
	}

	return resolvedRows;
}

/**
 * Collect weekdays and active year periods from a date set.
 */
function collectDateMetadata(
	dates: Set<OperationalDate>,
	periods: YearPeriod[],
	holidays: Holiday[],
): {
	period_ids: string[]
	weekdays: IsoWeekday[]
} {
	const weekdaysSet = new Set<IsoWeekday>();
	const periodIdsSet = new Set<string>();

	for (const date of dates) {
		weekdaysSet.add(calendarWeekday(yyyymmddToKey(date), holidays));

		const yearPeriodId = getActivePeriodId(date, periods);
		if (yearPeriodId) {
			periodIdsSet.add(yearPeriodId);
		}
	}

	return {
		period_ids: Array.from(periodIdsSet),
		weekdays: Array.from(weekdaysSet),
	};
}

/* * */

/**
 * Exports trips for a pattern.
 */
export async function exportTripsForPattern(
	routeData: Route,
	patternData: Pattern,
	shapeId: string,
	periods: YearPeriod[],
	holidays: Holiday[],
	events: Event[],
	startDate: Dates,
	endDate: Dates,
	serviceRegistry: ServiceRegistry,
	exportConfig: GtfsV29ExportConfig,
): Promise<TripSchedule[]> {
	try {
		const allRules = resolvePatternRules(patternData, events);

		// Step 1: Build raw rule-based schedule buckets
		const schedules = buildTimepointSchedules(
			allRules,
			periods,
			holidays,
			events,
			startDate,
			endDate,
		);

		if (schedules.size === 0) {
			return [];
		}

		// Step 1.5: Merge subset include schedules.
		// When include rule A's dates are a strict subset of include rule B's at the same
		// timepoint, A is redundant — absorb it into B so B runs on its full date set.
		mergeSubsetIncludeSchedules(schedules);

		// Step 2: Resolve final trip rows:
		// include dates minus overlapping exclude dates,
		// with serviceId deduplication based on final date sets.
		const resolvedTripRows = resolveTripRows(schedules, serviceRegistry, { events, periods });

		if (resolvedTripRows.length === 0) {
			return [];
		}

		// Step 3: Export trips
		const headsign = patternData.headsign.replaceAll(',', '').replace(/  +/g, ' ').trim();

		const sortedTripRows = resolvedTripRows.sort((a, b) => {
			const timeDiff = timepointToOperationalMinutes(a.timepoint) - timepointToOperationalMinutes(b.timepoint);
			if (timeDiff !== 0) return timeDiff;
			return a.ruleToken.localeCompare(b.ruleToken);
		});

		const tripSchedules: TripSchedule[] = [];

		for (const row of sortedTripRows) {
			const timepointHHMM = hhmm(row.timepoint);
			const startTimeStripped = timepointHHMM.split(':').join('');
			const tripId = `${patternData.code}|${row.ruleToken}|${startTimeStripped}`;

			const metadata = collectDateMetadata(row.dates, periods, holidays);

			tripSchedules.push({
				day_period: resolveDayPeriod(timepointHHMM),
				period_ids: metadata.period_ids,
				serviceId: row.serviceId,
				timepoint: timepointHHMM,
				trip_id: tripId,
				weekdays: metadata.weekdays,
			});

			const tripData: GtfsTMLTrip = {
				bikes_allowed: '0' as GtfsBikesAllowed,
				calendar_desc: '', // TODO: derive a readable description if needed
				direction_id: patternDirectionMapper.toGtfs(patternData.direction),
				pattern_id: patternData.code,
				pattern_short_name: headsign,
				route_id: routeData.code,
				service_id: row.serviceId,
				shape_id: shapeId,
				trip_headsign: headsign,
				trip_id: tripId,
				wheelchair_accessible: '0' as GtfsWheelchairBoarding,
			};

			await exportConfig.writers.trips.write(tripData);

			serviceRegistry.attachRuleToken(row.serviceId, row.ruleToken, patternData.code);
		}

		return tripSchedules;
	} catch (error) {
		throw new Error(`Error exporting trips for pattern ${patternData.code}: ${error}`);
	}
}
