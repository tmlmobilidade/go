/**
 * Scan an agency's patterns for timepoints that live in two (or more) overlapping
 * INCLUDE rules. These overlaps are what force the ` 2` / ` 3` numeric suffixes on
 * GTFS service_ids: the same circulation (pattern × timepoint × day) is described by
 * more than one rule, so the exporter has to split the date set and disambiguate.
 *
 * The classic case (and the one that is safe to fix by hand):
 *   - Rule A: "all periods, ALL days"      → timepoint 14:55
 *   - Rule B: "all periods, weekdays (DU)" → timepoint 14:55 (+ 41 others)
 *   B's scope (weekdays) is a strict subset of A's scope (all days). On weekdays 14:55
 *   is double-booked. Dropping 14:55 from B (the subset rule) loses nothing, because A
 *   still covers B's whole scope.
 *
 * Run from modules/offer/apps/gtfs-exporter:
 *   npm run rules:overlaps -- --agency 44
 *
 * Routed patterns only:
 *   npm run rules:overlaps -- --agency 44 --only-routed
 *
 * Limit to specific patterns:
 *   npm run rules:overlaps -- --agency 44 --pattern 1740_0_1,1741_0_2
 *
 * Save reports:
 *   npm run rules:overlaps -- --agency 44 --json /tmp/overlaps-44.json --csv /tmp/overlaps-44.csv
 */

import type { ManualRule, Pattern, ScheduleRule, YearPeriod } from '@tmlmobilidade/types';

import { lines, patterns, routes, yearPeriods } from '@tmlmobilidade/interfaces';
import { writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

const WEEKDAY_LABEL: Record<number, string> = {
	1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb', 7: 'Dom',
};
const ALL_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

interface RuleScope {
	months: number[]
	periodIds: string[]
	weekdays: number[]
}

interface OverlapRule {
	id: string
	monthsLabel: string
	name: string
	periodsLabel: string
	timepointCount: number
	weekdaysLabel: string
}

interface OverlapConflict {
	/** the subset rule id whose timepoint is safe to drop, or null for partial overlap */
	dropFromRuleId: null | string
	keepRuleId: null | string
	kind: 'partial' | 'subset'
	rules: OverlapRule[]
	timepoint: string
}

interface PatternReport {
	code: string
	conflicts: OverlapConflict[]
	lineId: string
}

async function parseArgs(argv: string[]) {
	const flag = (name: string) => argv.find((_, i, a) => a[i - 1] === name) ?? '';

	let agency = flag('--agency');
	if (!agency) {
		const rl = createInterface({ input: process.stdin, output: process.stdout });
		agency = await rl.question('Agency ID: ');
		rl.close();
	}

	const patternFilter = flag('--pattern');

	return {
		agency,
		csv: flag('--csv'),
		json: flag('--json'),
		onlyRouted: argv.includes('--only-routed'),
		patternCodes: patternFilter ? new Set(patternFilter.split(',').map(s => s.trim())) : null,
	};
}

async function loadAgencyPatterns(agencyId: string, onlyRouted: boolean): Promise<Pattern[]> {
	const agencyLines = await lines.findMany({ agency_id: agencyId }, { projection: { _id: 1 } });
	const lineIds = agencyLines.map(line => line._id);
	if (!lineIds.length) return [];

	const all = await patterns.findMany(
		{ line_id: { $in: lineIds } },
		{ projection: { code: 1, line_id: 1, route_id: 1, rules: 1 } },
	);

	if (!onlyRouted) return all;

	const live = new Set(
		(await routes.findMany({ line_id: { $in: lineIds } }, { projection: { _id: 1 } })).map(r => r._id),
	);
	return all.filter(p => live.has(p.route_id));
}

/** Manual include rules that are NOT event-linked (event-linked rules carry an extra date dimension). */
function plainIncludeRules(rules: ScheduleRule[] | undefined): ManualRule[] {
	return (rules ?? []).filter(
		(r): r is ManualRule => r.kind === 'manual' && r.operating_mode === 'include' && !r.event_id,
	);
}

function scopeOf(rule: ManualRule): RuleScope {
	return {
		months: rule.months?.length ? [...rule.months] : ALL_MONTHS,
		periodIds: rule.year_period_ids?.length ? [...rule.year_period_ids] : [],
		weekdays: rule.weekdays?.length ? [...rule.weekdays] : ALL_WEEKDAYS,
	};
}

function intersects(a: (number | string)[], b: (number | string)[]): boolean {
	const set = new Set(a);
	return b.some(x => set.has(x));
}

function isSubset(a: (number | string)[], b: (number | string)[]): boolean {
	const set = new Set(b);
	return a.every(x => set.has(x));
}

/** Periods: an empty list means "all periods". Compare with that semantics. */
function periodsOverlap(a: RuleScope, b: RuleScope): boolean {
	if (!a.periodIds.length || !b.periodIds.length) return true; // one covers all periods
	return intersects(a.periodIds, b.periodIds);
}

function periodsSubset(sub: RuleScope, sup: RuleScope): boolean {
	if (!sup.periodIds.length) return true; // superset covers all periods
	if (!sub.periodIds.length) return false; // sub covers all, sup does not → not a subset
	return isSubset(sub.periodIds, sup.periodIds);
}

function scopesOverlap(a: RuleScope, b: RuleScope): boolean {
	return intersects(a.weekdays, b.weekdays) && intersects(a.months, b.months) && periodsOverlap(a, b);
}

/** True if `sub`'s scope is fully contained in `sup`'s scope. */
function scopeIsSubset(sub: RuleScope, sup: RuleScope): boolean {
	return isSubset(sub.weekdays, sup.weekdays) && isSubset(sub.months, sup.months) && periodsSubset(sub, sup);
}

function weekdaysLabel(scope: RuleScope): string {
	if (scope.weekdays.length === 7) return 'todos os dias';
	return [...scope.weekdays].sort((a, b) => a - b).map(w => WEEKDAY_LABEL[w] ?? w).join('+');
}

function periodsLabel(scope: RuleScope, periodNames: Map<string, string>): string {
	if (!scope.periodIds.length) return 'todos os períodos';
	return scope.periodIds.map(id => periodNames.get(id) ?? id).join('+');
}

function monthsLabel(scope: RuleScope): string {
	if (scope.months.length === 12) return 'todos os meses';
	return scope.months.join(',');
}

function ruleDisplayName(rule: ManualRule): string {
	return rule.name?.trim() || rule._id;
}

function toOverlapRule(rule: ManualRule, periodNames: Map<string, string>): OverlapRule {
	const scope = scopeOf(rule);
	return {
		id: rule._id,
		monthsLabel: monthsLabel(scope),
		name: ruleDisplayName(rule),
		periodsLabel: periodsLabel(scope, periodNames),
		timepointCount: rule.timepoints.length,
		weekdaysLabel: weekdaysLabel(scope),
	};
}

function analysePattern(pattern: Pattern, periodNames: Map<string, string>): OverlapConflict[] {
	const includeRules = plainIncludeRules(pattern.rules);
	if (includeRules.length < 2) return [];

	// timepoint → rules that contain it
	const byTimepoint = new Map<string, ManualRule[]>();
	for (const rule of includeRules) {
		for (const tp of rule.timepoints) {
			if (!byTimepoint.has(tp)) byTimepoint.set(tp, []);
			byTimepoint.get(tp)?.push(rule);
		}
	}

	const conflicts: OverlapConflict[] = [];

	for (const [timepoint, rulesWithTp] of byTimepoint) {
		if (rulesWithTp.length < 2) continue;

		// Does any pair of these rules have overlapping scope?
		let overlappingPair: [ManualRule, ManualRule] | null = null;
		outer: for (let i = 0; i < rulesWithTp.length; i++) {
			for (let j = i + 1; j < rulesWithTp.length; j++) {
				if (scopesOverlap(scopeOf(rulesWithTp[i]), scopeOf(rulesWithTp[j]))) {
					overlappingPair = [rulesWithTp[i], rulesWithTp[j]];
					break outer;
				}
			}
		}
		if (!overlappingPair) continue;

		const [a, b] = overlappingPair;
		const scopeA = scopeOf(a);
		const scopeB = scopeOf(b);

		let kind: 'partial' | 'subset' = 'partial';
		let dropFromRuleId: null | string = null;
		let keepRuleId: null | string = null;

		if (scopeIsSubset(scopeA, scopeB)) {
			kind = 'subset';
			dropFromRuleId = a._id; // a is the narrower rule → drop its timepoint
			keepRuleId = b._id;
		} else if (scopeIsSubset(scopeB, scopeA)) {
			kind = 'subset';
			dropFromRuleId = b._id;
			keepRuleId = a._id;
		}

		conflicts.push({
			dropFromRuleId,
			keepRuleId,
			kind,
			rules: rulesWithTp.map(r => toOverlapRule(r, periodNames)),
			timepoint,
		});
	}

	conflicts.sort((x, y) => x.timepoint.localeCompare(y.timepoint));
	return conflicts;
}

function buildPeriodNames(periods: YearPeriod[]): Map<string, string> {
	const map = new Map<string, string>();
	for (const p of periods) map.set(p._id, p.code || p.name);
	return map;
}

async function main() {
	const { agency, csv, json, onlyRouted, patternCodes } = await parseArgs(process.argv.slice(2));

	const [agencyPatterns, periods] = await Promise.all([
		loadAgencyPatterns(agency, onlyRouted),
		yearPeriods.findMany({ agency_ids: { $in: [agency] } }),
	]);

	const periodNames = buildPeriodNames(periods);
	const scoped = patternCodes
		? agencyPatterns.filter(p => patternCodes.has(p.code))
		: agencyPatterns;

	const reports: PatternReport[] = [];
	for (const pattern of scoped) {
		const conflicts = analysePattern(pattern, periodNames);
		if (conflicts.length) {
			reports.push({ code: pattern.code, conflicts, lineId: pattern.line_id });
		}
	}

	reports.sort((a, b) => a.code.localeCompare(b.code));

	// ── Console output ──────────────────────────────────────────────────────────

	const totalConflicts = reports.reduce((n, r) => n + r.conflicts.length, 0);
	const subsetConflicts = reports.reduce(
		(n, r) => n + r.conflicts.filter(c => c.kind === 'subset').length, 0,
	);

	console.log('=== Overlapping include-rule timepoints ===');
	console.log(`Agency ${agency}${onlyRouted ? ' (routed only)' : ''} — ${scoped.length} patterns scanned`);
	console.log(`Patterns with overlaps:  ${reports.length}`);
	console.log(`Overlapping timepoints:  ${totalConflicts} (${subsetConflicts} safe/subset, ${totalConflicts - subsetConflicts} partial)`);
	console.log();

	for (const report of reports) {
		console.log(`▶ ${report.code}  (line ${report.lineId})`);
		for (const c of report.conflicts) {
			const tag = c.kind === 'subset' ? 'SAFE  ' : 'REVIEW';
			console.log(`  [${tag}] ${c.timepoint} appears in ${c.rules.length} include rules:`);
			for (const r of c.rules) {
				const marker = r.id === c.dropFromRuleId ? 'DROP' : r.id === c.keepRuleId ? 'KEEP' : '    ';
				console.log(
					`      ${marker}  "${r.name}"  [${r.weekdaysLabel} · ${r.periodsLabel} · ${r.monthsLabel}]  (${r.timepointCount} tps)`,
				);
			}
			if (c.kind === 'subset') {
				const drop = c.rules.find(r => r.id === c.dropFromRuleId);
				console.log(`      → remove ${c.timepoint} from "${drop?.name}" (its scope is fully covered by the KEEP rule)`);
			} else {
				console.log(`      → partial overlap; rules share ${c.timepoint} on some days but neither scope contains the other. Needs a manual scope split.`);
			}
		}
		console.log();
	}

	if (!reports.length) {
		console.log('No overlapping include-rule timepoints found.');
		console.log();
	}

	// ── CSV output ──────────────────────────────────────────────────────────────

	if (csv) {
		const header = [
			'pattern', 'line_id', 'timepoint', 'kind',
			'rule_name', 'rule_weekdays', 'rule_periods', 'rule_months', 'rule_timepoints', 'action',
		].join(',');
		const csvLines: string[] = [];
		for (const report of reports) {
			for (const c of report.conflicts) {
				for (const r of c.rules) {
					const action = r.id === c.dropFromRuleId ? 'drop' : r.id === c.keepRuleId ? 'keep' : 'review';
					csvLines.push([
						report.code, report.lineId, c.timepoint, c.kind,
						JSON.stringify(r.name), JSON.stringify(r.weekdaysLabel),
						JSON.stringify(r.periodsLabel), JSON.stringify(r.monthsLabel),
						r.timepointCount, action,
					].join(','));
				}
			}
		}
		writeFileSync(csv, [header, ...csvLines].join('\n'));
		console.log(`CSV: ${csvLines.length} rows written to ${csv}`);
	}

	// ── JSON output ─────────────────────────────────────────────────────────────

	if (json) {
		writeFileSync(json, JSON.stringify({
			agency,
			generatedAt: new Date().toISOString(),
			patterns: reports,
			totals: { partialConflicts: totalConflicts - subsetConflicts, patternsWithOverlaps: reports.length, subsetConflicts, totalConflicts },
		}, null, 2));
		console.log(`JSON: report written to ${json}`);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
