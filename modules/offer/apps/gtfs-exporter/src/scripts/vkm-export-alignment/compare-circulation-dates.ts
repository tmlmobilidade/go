/*
 * Date / timepoint drill-down: GTFS export vs GO computeActiveRules for one or more patterns.
 *
 * Run from modules/offer/apps/api:
 *   npm run vkm:dates -- --agency 44 --start 20260101 \
 *     --gtfs ../gtfs-exporter/output_44 --pattern 4432_0_1
 *
 * Top N patterns by delta (no --pattern needed):
 *   npm run vkm:dates -- --agency 44 --start 20260101 --gtfs ../gtfs-exporter/output_44 --top 5
 *
 * All patterns with any delta:
 *   ... --all-with-delta
 *
 * Single date inspection:
 *   ... --pattern 4432_0_1 --date 20260407
 *
 * Save JSON report:
 *   ... --json /tmp/dates-44.json
 *
 * Save CSV (missing slots):
 *   ... --pattern 4432_0_1 --csv /tmp/missing.csv
 */

import type { OperationalDate, Pattern } from '@tmlmobilidade/types';

import { buildOperationalDateRange, computeActiveRules, Dates, getPatternExtensionMeters, resolvePatternRules } from '@tmlmobilidade/dates';
import { events, holidays, lines, patterns, yearPeriods } from '@tmlmobilidade/interfaces';
import { writeFileSync } from 'node:fs';

import {
	buildGtfsOffSlots,
	buildGtfsOperatingSlots,
	type GtfsTripEntry,
	loadGtfsExportIndex,
} from './gtfs-export-io.js';

interface MissingSlot {
	date: OperationalDate
	distanceKm: number
	goCount: number
	gtfsCount: number
	isOff: boolean
	ruleToken: string
	serviceId: string
	timepoint: string
	tripId: string
}

interface DateSummary {
	date: OperationalDate
	extraInGo: number
	goTimepoints: number
	gtfsOnlyTimepoints: string[]
	gtfsTimepoints: number
	missingInGo: number
}

interface PatternReport {
	code: string
	dateSummaries: DateSummary[]
	extensionM: number
	extraInGoSlots: number
	goDays: number
	gtfsDays: number
	missingInGoSlots: number
	missingSamples: MissingSlot[]
	offOnlyInGtfsSlots: number
	topMissingByTimepoint: Array<{ count: number, timepoint: string }>
}

interface DatesReport {
	agency: string
	generatedAt: string
	gtfsDir: string
	patterns: PatternReport[]
	window: string
}

function parseArgs(argv: string[]) {
	const agency = argv.find((_, i, a) => a[i - 1] === '--agency') ?? '42';
	const start = argv.find((_, i, a) => a[i - 1] === '--start') ?? '20260101';
	const gtfsDir = argv.find((_, i, a) => a[i - 1] === '--gtfs') ?? '';
	const patternArg = argv.find((_, i, a) => a[i - 1] === '--pattern') ?? '';
	const csvPath = argv.find((_, i, a) => a[i - 1] === '--csv') ?? '';
	const jsonPath = argv.find((_, i, a) => a[i - 1] === '--json') ?? '';
	const top = Number(argv.find((_, i, a) => a[i - 1] === '--top') ?? '5');
	const maxDetail = Number(argv.find((_, i, a) => a[i - 1] === '--max-detail') ?? '40');
	const allWithDelta = argv.includes('--all-with-delta');
	const onlyDate = argv.find((_, i, a) => a[i - 1] === '--date') ?? '';
	const patternsList = patternArg
		? patternArg.split(',').map(s => s.trim()).filter(Boolean)
		: [];

	return { agency, allWithDelta, csvPath, gtfsDir, jsonPath, maxDetail, onlyDate, patternsList, start, top };
}

function findTripMeta(
	trips: GtfsTripEntry[],
	serviceDates: Map<string, Set<string>>,
	date: string,
	timepoint: string,
	off: boolean,
) {
	return trips.find(trip =>
		trip.isOff === off
		&& trip.timepoint === timepoint
		&& serviceDates.get(trip.serviceId)?.has(date),
	);
}

function analyzePattern(
	pattern: Pattern,
	operationalDates: OperationalDate[],
	gtfsTrips: GtfsTripEntry[],
	serviceDates: Map<string, Set<string>>,
	periods: Awaited<ReturnType<typeof yearPeriods.findMany>>,
	holidaysList: Awaited<ReturnType<typeof holidays.findMany>>,
	eventsList: Awaited<ReturnType<typeof events.findMany>>,
): PatternReport {
	const extensionM = getPatternExtensionMeters(pattern, 'go');
	const mergedRules = resolvePatternRules(pattern, eventsList);
	const gtfsOperating = buildGtfsOperatingSlots(gtfsTrips, serviceDates);
	const gtfsOff = buildGtfsOffSlots(gtfsTrips, serviceDates);

	let goDays = 0;
	let gtfsDays = 0;
	let missingInGoSlots = 0;
	let extraInGoSlots = 0;
	let offOnlyInGtfsSlots = 0;

	const missingSamples: MissingSlot[] = [];
	const dateSummaries: DateSummary[] = [];
	const missingByTimepoint = new Map<string, number>();

	for (const date of operationalDates) {
		const goSet = new Set<string>(
			mergedRules.length
				? computeActiveRules(date, mergedRules, periods, holidaysList, { events: eventsList }).timepoints
				: [],
		);
		const gtfsSet = gtfsOperating.get(date) ?? new Set<string>();
		const offSet = gtfsOff.get(date) ?? new Set<string>();

		goDays += goSet.size;
		gtfsDays += gtfsSet.size;

		const gtfsOnly: string[] = [];
		let missingOnDate = 0;
		let extraOnDate = 0;

		for (const tp of gtfsSet) {
			if (!goSet.has(tp)) {
				missingOnDate += 1;
				missingInGoSlots += 1;
				missingByTimepoint.set(tp, (missingByTimepoint.get(tp) ?? 0) + 1);
				gtfsOnly.push(tp);

				const meta = findTripMeta(gtfsTrips, serviceDates, date, tp, false);
				missingSamples.push({
					date,
					distanceKm: meta?.distanceKm ?? extensionM / 1000,
					goCount: goSet.size,
					gtfsCount: gtfsSet.size,
					isOff: false,
					ruleToken: meta?.ruleToken ?? '',
					serviceId: meta?.serviceId ?? '',
					timepoint: tp,
					tripId: meta?.tripId ?? '',
				});
			}
		}

		for (const tp of goSet) {
			if (!gtfsSet.has(tp)) {
				extraOnDate += 1;
				extraInGoSlots += 1;
			}
		}

		for (const tp of offSet) {
			if (!goSet.has(tp)) offOnlyInGtfsSlots += 1;
		}

		if (missingOnDate > 0 || extraOnDate > 0) {
			dateSummaries.push({
				date,
				extraInGo: extraOnDate,
				goTimepoints: goSet.size,
				gtfsOnlyTimepoints: gtfsOnly.sort(),
				gtfsTimepoints: gtfsSet.size,
				missingInGo: missingOnDate,
			});
		}
	}

	const topMissingByTimepoint = [...missingByTimepoint.entries()]
		.map(([timepoint, count]) => ({ count, timepoint }))
		.sort((a, b) => b.count - a.count);

	return {
		code: pattern.code,
		dateSummaries: dateSummaries.sort((a, b) => b.missingInGo - a.missingInGo),
		extensionM,
		extraInGoSlots,
		goDays,
		gtfsDays,
		missingInGoSlots,
		missingSamples,
		offOnlyInGtfsSlots,
		topMissingByTimepoint,
	};
}

function printSingleDateReport(
	patternCode: string,
	date: OperationalDate,
	goSet: Set<string>,
	gtfsSet: Set<string>,
	gtfsTrips: GtfsTripEntry[],
	serviceDates: Map<string, Set<string>>,
) {
	const onlyInGtfs = [...gtfsSet].filter(tp => !goSet.has(tp)).sort();
	const onlyInGo = [...goSet].filter(tp => !gtfsSet.has(tp)).sort();

	console.log(`\n--- Single date: ${date} (${patternCode}) ---`);
	console.log(`GO operating timepoints:     ${goSet.size}`);
	console.log(`GTFS operating timepoints:   ${gtfsSet.size}`);
	if (goSet.size) console.log(`  GO:   ${[...goSet].sort().join(', ')}`);
	if (gtfsSet.size) console.log(`  GTFS: ${[...gtfsSet].sort().join(', ')}`);

	if (onlyInGo.length) {
		console.log(`\nIn GO only (${onlyInGo.length}): ${onlyInGo.join(', ')}`);
	}
	if (onlyInGtfs.length) {
		console.log(`\nIn GTFS only (${onlyInGtfs.length}): ${onlyInGtfs.join(', ')}`);
		for (const tp of onlyInGtfs) {
			const meta = findTripMeta(gtfsTrips, serviceDates, date, tp, false);
			if (meta) console.log(`  ${tp} → ${meta.ruleToken} (${meta.serviceId})`);
		}
	}
	if (!onlyInGo.length && !onlyInGtfs.length && goSet.size === gtfsSet.size) {
		console.log('\nMatch: same operating timepoints on this date.');
	}
}

function printPatternReport(report: PatternReport, maxDetail: number) {
	const delta = report.gtfsDays - report.goDays;
	const deltaKm = (delta * report.extensionM) / 1000;

	console.log(`\n${'='.repeat(72)}`);
	console.log(`Pattern: ${report.code}`);
	console.log(`Extension: ${(report.extensionM / 1000).toFixed(3)} km`);
	console.log(`GTFS operating slots: ${report.gtfsDays.toLocaleString('en-GB')}  |  GO timepoint-days: ${report.goDays.toLocaleString('en-GB')}  |  Δ: ${delta} (${deltaKm >= 0 ? '+' : ''}${deltaKm.toFixed(1)} km)`);
	console.log(`Slots in GTFS but not GO (operating): ${report.missingInGoSlots}`);
	console.log(`Slots in GO but not GTFS (operating): ${report.extraInGoSlots}`);
	console.log(`OFF slots in GTFS only (info): ${report.offOnlyInGtfsSlots}`);

	if (report.topMissingByTimepoint.length) {
		console.log('\nMissing (date×timepoint) count by timepoint (top 12):');
		for (const row of report.topMissingByTimepoint.slice(0, 12)) {
			console.log(`  ${row.timepoint.padEnd(8)} ${row.count} days`);
		}
	}

	const hotDates = report.dateSummaries.filter(d => d.missingInGo > 0).slice(0, 15);
	if (hotDates.length) {
		console.log('\nDates with most GTFS timepoints missing in GO (top 15):');
		console.log('date        missing  gtfs_tp  go_tp   gtfs-only timepoints (sample)');
		for (const d of hotDates) {
			const sample = d.gtfsOnlyTimepoints.slice(0, 6).join(', ');
			const more = d.gtfsOnlyTimepoints.length > 6 ? ` +${d.gtfsOnlyTimepoints.length - 6}` : '';
			console.log(
				`${d.date}      ${String(d.missingInGo).padStart(7)}  ${String(d.gtfsTimepoints).padStart(7)}  ${String(d.goTimepoints).padStart(5)}   ${sample}${more}`,
			);
		}
	}

	if (report.missingSamples.length) {
		console.log(`\nFirst ${Math.min(maxDetail, report.missingSamples.length)} missing slots (date × timepoint):`);
		console.log('date        time   service_id          token                 trip_id');
		for (const row of report.missingSamples.slice(0, maxDetail)) {
			console.log(
				`${row.date}  ${row.timepoint.padEnd(6)} ${row.serviceId.padEnd(18)} ${row.ruleToken.slice(0, 20).padEnd(20)}  ${row.tripId.slice(0, 50)}`,
			);
		}
	}
}

function writeCsv(path: string, rows: MissingSlot[]) {
	const header = 'pattern_code,date,timepoint,service_id,rule_token,trip_id,distance_km,go_timepoints_that_day,gtfs_timepoints_that_day\n';
	const body = rows.map(r =>
		[
			r.tripId.split('|')[0] ?? '',
			r.date,
			r.timepoint,
			r.serviceId,
			r.ruleToken,
			r.tripId,
			r.distanceKm,
			r.goCount,
			r.gtfsCount,
		].join(','),
	).join('\n');
	writeFileSync(path, header + body, 'utf8');
	console.log(`\nCSV: ${rows.length} rows written to ${path}`);
}

function printAggregateMissingDays(allMissing: MissingSlot[]) {
	const byDate = new Map<string, { patterns: Set<string>, slots: number }>();

	for (const row of allMissing) {
		const patternCode = row.tripId.split('|')[0] ?? '';
		const entry = byDate.get(row.date) ?? { patterns: new Set<string>(), slots: 0 };
		entry.patterns.add(patternCode);
		entry.slots += 1;
		byDate.set(row.date, entry);
	}

	const sorted = [...byDate.entries()].sort((a, b) => b[1].slots - a[1].slots);

	console.log('\n=== Aggregate: dates where GTFS has slots missing in GO ===');
	console.log(`Unique dates with mismatches: ${sorted.length}`);
	console.log(`Total missing (date×timepoint) slots: ${allMissing.length}`);
	console.log('date        slots   patterns');
	for (const [date, info] of sorted) {
		console.log(`${date}  ${String(info.slots).padStart(7)}   ${info.patterns.size}`);
	}
}

async function resolvePatternsToAnalyze(
	agencyId: string,
	patternsList: string[],
	top: number,
	allWithDelta: boolean,
	gtfsIndex: ReturnType<typeof loadGtfsExportIndex>,
	operationalDates: OperationalDate[],
	periods: Awaited<ReturnType<typeof yearPeriods.findMany>>,
	holidaysList: Awaited<ReturnType<typeof holidays.findMany>>,
	eventsList: Awaited<ReturnType<typeof events.findMany>>,
): Promise<Pattern[]> {
	const agencyLines = await lines.findMany({ agency_id: agencyId }, { projection: { _id: 1 } });
	const lineIds = agencyLines.map(l => l._id);
	const allPatterns = await patterns.findMany(
		{ line_id: { $in: lineIds } },
		{ projection: { code: 1, line_id: 1, route_id: 1, rules: 1, shape: 1 } },
	);

	if (patternsList.length) {
		const selected = allPatterns.filter(p => patternsList.includes(p.code));
		const missing = patternsList.filter(code => !selected.some(p => p.code === code));
		if (missing.length) console.warn(`Patterns not found in Mongo: ${missing.join(', ')}`);
		return selected;
	}

	const deltas: Array<{ code: string, delta: number, pattern: Pattern }> = [];

	for (const pattern of allPatterns) {
		const trips = gtfsIndex.tripsByPattern.get(pattern.code) ?? [];
		if (!trips.length) continue;

		const report = analyzePattern(
			pattern,
			operationalDates,
			trips,
			gtfsIndex.serviceDates,
			periods,
			holidaysList,
			eventsList,
		);
		if (report.gtfsDays > report.goDays) {
			deltas.push({ code: pattern.code, delta: report.gtfsDays - report.goDays, pattern });
		}
	}

	deltas.sort((a, b) => b.delta - a.delta);
	const limit = allWithDelta ? deltas.length : top;
	return deltas.slice(0, limit).map(d => d.pattern);
}

async function main() {
	const { agency, allWithDelta, csvPath, gtfsDir, jsonPath, maxDetail, onlyDate, patternsList, start, top } = parseArgs(process.argv.slice(2));
	if (!gtfsDir) throw new Error('Missing --gtfs path to export folder');

	const startDate = Dates.fromOperationalDate(start, 'Europe/Lisbon');
	const endOp = startDate.plus({ years: 1 }).operational_date;
	const fullRange = buildOperationalDateRange(startDate.js_date, Dates.fromOperationalDate(endOp, 'Europe/Lisbon').js_date);
	const operationalDates = onlyDate
		? [onlyDate as OperationalDate]
		: fullRange;

	const gtfsIndex = loadGtfsExportIndex(gtfsDir, start, endOp);
	const [periods, holidaysList, eventsList] = await Promise.all([
		yearPeriods.findMany({ agency_ids: { $in: [agency] } }),
		holidays.findMany({ agency_ids: { $in: [agency] } }),
		events.findMany({ agency_ids: { $in: [agency] } }),
	]);

	const toAnalyze = await resolvePatternsToAnalyze(
		agency,
		patternsList,
		top,
		allWithDelta,
		gtfsIndex,
		operationalDates,
		periods,
		holidaysList,
		eventsList,
	);

	console.log('=== GTFS vs GO: missing dates / timepoints ===');
	console.log(`Agency ${agency}, window ${onlyDate ? onlyDate : `${start}..${endOp}`}`);
	console.log(`GTFS folder: ${gtfsDir}`);
	console.log(`Analyzing ${toAnalyze.length} pattern(s): ${toAnalyze.map(p => p.code).join(', ') || '(none with delta)'}`);

	const allMissing: MissingSlot[] = [];
	const patternReports: PatternReport[] = [];

	for (const pattern of toAnalyze) {
		const trips = gtfsIndex.tripsByPattern.get(pattern.code) ?? [];
		const mergedRules = resolvePatternRules(pattern, eventsList);
		const gtfsOperating = buildGtfsOperatingSlots(trips, gtfsIndex.serviceDates);

		if (onlyDate) {
			const date = onlyDate as OperationalDate;
			const goSet = new Set<string>(
				mergedRules.length
					? computeActiveRules(date, mergedRules, periods, holidaysList, { events: eventsList }).timepoints
					: [],
			);
			const gtfsSet = gtfsOperating.get(date) ?? new Set<string>();
			printSingleDateReport(pattern.code, date, goSet, gtfsSet, trips, gtfsIndex.serviceDates);
		}

		const report = analyzePattern(
			pattern,
			operationalDates,
			trips,
			gtfsIndex.serviceDates,
			periods,
			holidaysList,
			eventsList,
		);
		if (!onlyDate) {
			printPatternReport(report, maxDetail);
		}
		allMissing.push(...report.missingSamples);
		patternReports.push(report);
	}

	if (allMissing.length) {
		printAggregateMissingDays(allMissing);
	} else if (toAnalyze.length > 0) {
		console.log('\nAll analyzed patterns are aligned with GO.');
	}

	if (csvPath && allMissing.length) {
		writeCsv(csvPath, allMissing);
	}

	if (jsonPath) {
		const report: DatesReport = {
			agency,
			generatedAt: new Date().toISOString(),
			gtfsDir,
			patterns: patternReports,
			window: onlyDate ? onlyDate : `${start}..${endOp}`,
		};
		writeFileSync(jsonPath, JSON.stringify(report, null, 2));
		console.log(`\nJSON: report written to ${jsonPath}`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
