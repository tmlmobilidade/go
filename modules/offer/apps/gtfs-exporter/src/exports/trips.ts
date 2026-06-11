import { type GtfsV29ExportConfig } from '@/types.js';
import { type ServiceId, type ServiceRegistry } from '@/utils/service-registry.js';
import { buildOperationalDateRange, buildRuleSummaryGtfs, calendarWeekday, type CanonicalDateCache, collectGtfsIncludeContributionsForDate, compareGeneralManualOwnershipPriority, computeActiveRules, computeOffRowDates, Dates, getActivePeriodId, getTimepointsRemovedByEventRestriction, resolveDayPeriod, resolvePatternRules, splitOperationalDatesByExcludeOverlap, yyyymmddToKey } from '@tmlmobilidade/dates';
import { DayPeriod, type Event, GtfsBikesAllowed, GtfsTMLTrip, GtfsWheelchairBoarding, type HHMM, hhmm, type Holiday, type IsoWeekday, type ManualRule, type OperationalDate, type Pattern, patternDirectionMapper, type Route, type ScheduleRule, type YearPeriod } from '@tmlmobilidade/types';

/* * */

function isEventSpecificManual(rule: ScheduleRule): rule is ManualRule {
	return rule.kind === 'manual' && !!(rule as ManualRule).event_id;
}

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

		// 2) Build ON buckets via shared GTFS attribution (replacement context + OFF pairs)
		const activeIncludeTimepoints = collectIncludeTimepointsForDate(
			schedules,
			operationalDate,
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

function collectIncludeTimepointsForDate(
	schedules: Map<string, RuleTimepointSchedule>,
	operationalDate: OperationalDate,
	allRules: ScheduleRule[],
	periods: YearPeriod[],
	holidays: Holiday[],
	events: Event[],
): Set<HHMM> {
	const activeIncludeTimepoints = new Set<HHMM>();

	const contributions = collectGtfsIncludeContributionsForDate(
		operationalDate,
		allRules,
		periods,
		holidays,
		{ events },
	);

	for (const contribution of contributions) {
		if (contribution.kind === 'operating') {
			activeIncludeTimepoints.add(contribution.timepoint);

			addScheduleDate(schedules, {
				date: operationalDate,
				mode: 'include',
				rule: contribution.rule,
				timepoint: contribution.timepoint,
			});

			continue;
		}

		if (contribution.kind === 'base_off' && contribution.excludeRule) {
			addScheduleDate(schedules, {
				date: operationalDate,
				mode: 'include',
				rule: contribution.rule,
				timepoint: contribution.timepoint,
			});
			addScheduleDate(schedules, {
				date: operationalDate,
				mode: 'exclude',
				rule: contribution.excludeRule,
				timepoint: contribution.timepoint,
			});
		}
	}

	return activeIncludeTimepoints;
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

		// Event restrictions: all day, explicit timepoints, or time window (same as computeActiveRules).
		if (rule.kind === 'event_restriction') {
			if (!rule.dates?.includes(operationalDate)) continue;

			for (const timepoint of getTimepointsRemovedByEventRestriction(rule, activeIncludeTimepoints)) {
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
 * Event-replacement includes are never absorbed. Excludes are not deleted here —
 * base_off pairs attach excludes to a different rule id than the dominated include.
 *
 * Event-specific manuals (ND-05) are never absorbed: a general rule may run every
 * Saturday while the event manual only runs on Santo António — strict subset is expected.
 */
export function mergeSubsetIncludeSchedules(schedules: Map<string, RuleTimepointSchedule>): void {
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
			if (a.rule.kind === 'event_replacement') continue;
			if (isEventSpecificManual(a.rule)) continue;

			// A is dominated if there exists B with a.dates ⊊ b.dates (strict subset).
			const isDominated = includes.some((b) => {
				if (b.rule._id === a.rule._id) return false;
				if (isEventSpecificManual(b.rule)) return false;

				return b.dates.size > a.dates.size && [...a.dates].every(d => b.dates.has(d));
			});

			if (isDominated) {
				keysToDelete.add(`${a.rule._id}|include|${a.timepoint}`);
			}
		}
	}

	for (const key of keysToDelete) {
		schedules.delete(key);
	}
}

interface PendingTripRow {
	dates: Set<OperationalDate>
	includeSchedule: RuleTimepointSchedule
	isOffRow: boolean
	overlappingExcludeSchedules: RuleTimepointSchedule[]
}

/** P1: at most one plain trip row per (timepoint, date). Keeps the primary manual owner (ND-03). */
function dedupePlainRowsOneTripPerDate(plainRows: PendingTripRow[]): PendingTripRow[] {
	const sorted = [...plainRows].sort((a, b) => {
		const aManual = a.includeSchedule.rule;
		const bManual = b.includeSchedule.rule;
		if (aManual.kind === 'manual' && bManual.kind === 'manual') {
			const priority = compareGeneralManualOwnershipPriority(aManual, bManual);
			if (priority !== 0) return priority;
		}
		return (aManual._id ?? '').localeCompare(bManual._id ?? '');
	});

	const datesClaimed = new Set<OperationalDate>();
	const deduped: PendingTripRow[] = [];

	for (const row of sorted) {
		const dates = new Set([...row.dates].filter(date => !datesClaimed.has(date)));
		if (dates.size === 0) continue;

		for (const date of dates) datesClaimed.add(date);
		deduped.push({ ...row, dates });
	}

	return deduped;
}

/**
 * Resolves final exportable trip rows.
 *
 * Final semantics:
 * - one row per include rule + timepoint (+ plain/OFF split when exclude overlap is date-specific)
 * - if exclude rules overlap this include on specific dates, those dates become OFF rows
 *   (`INCLUDE-OFF-ex1-ex2`) with canonical base minus canonical excludes
 * - dates without exclude overlap stay plain (operational day-walk dates, no canonical expansion)
 * - if resulting dates are empty, skip the row
 *
 * @see ND-04 in export-attribution/SCENARIOS.md
 */
function resolveTripRows(
	schedules: Map<string, RuleTimepointSchedule>,
	serviceRegistry: ServiceRegistry,
	{
		events,
		exportDates,
		holidays,
		periods,
	}: {
		events: Event[]
		exportDates: readonly OperationalDate[]
		holidays: Holiday[]
		periods: YearPeriod[]
	},
): ResolvedTripRow[] {
	const canonicalCache: CanonicalDateCache = new Map();
	const registryOptions = { events, holidays, periods };
	const groupedByTimepoint = groupSchedulesByTimepoint(schedules);
	const resolvedRows: ResolvedTripRow[] = [];

	for (const [timepoint, timepointSchedules] of groupedByTimepoint.entries()) {
		const includeSchedules = timepointSchedules.filter(schedule => schedule.mode === 'include');
		const excludeSchedules = timepointSchedules.filter(schedule => schedule.mode === 'exclude');

		const pendingRows: PendingTripRow[] = [];

		for (const includeSchedule of includeSchedules) {
			const {
				offOperationalDates,
				overlappingExcludeSchedules,
				plainOperationalDates,
			} = splitOperationalDatesByExcludeOverlap(
				includeSchedule.dates,
				includeSchedule.rule._id,
				excludeSchedules,
			);

			if (plainOperationalDates.size > 0) {
				pendingRows.push({
					dates: plainOperationalDates,
					includeSchedule,
					isOffRow: false,
					// overlappingExcludeSchedules: [],
					overlappingExcludeSchedules: excludeSchedules.filter(ex =>
						overlappingExcludeSchedules.some(o => o.rule._id === ex.rule._id),
					),
				});
			}

			if (offOperationalDates.size > 0 && overlappingExcludeSchedules.length > 0) {
				const offDates = computeOffRowDates(
					includeSchedule.rule,
					overlappingExcludeSchedules,
					canonicalCache,
					exportDates,
					registryOptions,
					offOperationalDates,
					includeSchedule.dates,
				);

				if (offDates.size > 0) {
					pendingRows.push({
						dates: offDates,
						includeSchedule,
						isOffRow: true,
						overlappingExcludeSchedules: excludeSchedules.filter(ex =>
							overlappingExcludeSchedules.some(o => o.rule._id === ex.rule._id),
						),
					});
				}
			}
		}

		// Plain operating rows claim dates first (P1). OFF rows use canonical base−event for
		// calendar membership, but must not be active on days a plain row already owns at this
		// timepoint (e.g. ESC_DU + ALL_DU-OFF-DIA_CARN on school weekdays).
		const plainRows = dedupePlainRowsOneTripPerDate(pendingRows.filter(row => !row.isOffRow));
		const offRows = pendingRows.filter(row => row.isOffRow);
		const datesClaimedByPlainRows = new Set<OperationalDate>();

		for (const row of plainRows) {
			for (const date of row.dates) {
				datesClaimedByPlainRows.add(date);
			}
		}

		for (const row of [...plainRows, ...offRows]) {
			const resultingDates = row.isOffRow
				? new Set([...row.dates].filter(date => !datesClaimedByPlainRows.has(date)))
				: row.dates;

			if (resultingDates.size === 0) continue;

			const includeRuleName = buildRuleSummaryGtfs(row.includeSchedule.rule, { events, periods });
			const excludeRuleNames = [...new Set(
				row.overlappingExcludeSchedules.map(s => buildRuleSummaryGtfs(s.rule, { events, periods })),
			)].sort();

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

/** Debug helper: resolve trip rows for one pattern without writing GTFS files. */
export function debugResolvePatternTripRows(
	patternData: Pattern,
	periods: YearPeriod[],
	holidays: Holiday[],
	events: Event[],
	startDate: Dates,
	endDate: Dates,
	serviceRegistry: ServiceRegistry,
): ResolvedTripRow[] {
	const allRules = resolvePatternRules(patternData, events);
	const schedules = buildTimepointSchedules(allRules, periods, holidays, events, startDate, endDate);
	if (schedules.size === 0) return [];

	mergeSubsetIncludeSchedules(schedules);

	const exportDates = buildOperationalDateRange(startDate.js_date, endDate.js_date);
	return resolveTripRows(schedules, serviceRegistry, {
		events,
		exportDates,
		holidays,
		periods,
	});
}

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

		const exportDates = buildOperationalDateRange(startDate.js_date, endDate.js_date);

		// Step 2: Resolve final trip rows from canonical calendars + OFF excludes.
		const resolvedTripRows = resolveTripRows(schedules, serviceRegistry, {
			events,
			exportDates,
			holidays,
			periods,
		});

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
