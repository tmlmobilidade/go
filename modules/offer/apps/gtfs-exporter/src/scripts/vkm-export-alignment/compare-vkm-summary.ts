/**
 * Unified VKM + circulation comparison: GO explorer vs GTFS export (gtfs-comparator formula).
 *
 * Interactive (prompts for agency, date, folder):
 *   npm run vkm:check
 *
 * Non-interactive (all flags inline):
 *   npm run vkm:check -- --agency 44 --start 20260101 --gtfs ../gtfs-exporter/output_44
 *
 * Save JSON report:
 *   npm run vkm:check -- --agency 44 --start 20260101 --gtfs ../gtfs-exporter/output_44 \
 *     --json /tmp/vkm-44.json
 *
 * Save CSV per pattern (Excel-friendly):
 *   ... --csv /tmp/vkm-44.csv
 *
 * Limit to routed patterns only:
 *   ... --only-routed
 */

import type { CalculateVkmDto, OperationalDate, Pattern } from '@tmlmobilidade/types';

import { buildOperationalDateRange, calculateAgencyVkm, computeActiveRules, Dates, getPatternExtensionMeters, resolvePatternRules } from '@tmlmobilidade/dates';
import { agencies, events, holidays, lines, patterns, routes, yearPeriods } from '@tmlmobilidade/interfaces';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';

import { buildGtfsOperatingSlots, type GtfsTripEntry, loadGtfsExportIndex } from './gtfs-export-io.js';

interface PatternRow {
	code: string
	deltaDays: number
	deltaKm: number
	duplicateDays: number
	duplicateKm: number
	extensionKm: number
	goDays: number
	goKm: number
	gtfsDays: number
	gtfsKm: number
	gtfsUniqueDays: number
	gtfsUniqueKm: number
}

interface SummaryReport {
	agency: string
	generatedAt: string
	gtfsDir: string
	hasAlignmentIssues: boolean
	patterns: PatternRow[]
	totals: {
		deltaKm: number
		deltaPercent: number
		duplicateDays: number
		duplicateKm: number
		goDays: number
		goKm: number
		gtfsDays: number
		gtfsKm: number
		gtfsUniqueDays: number
		gtfsUniqueKm: number
		ruleGapDays: number
		ruleGapKm: number
	}
	window: {
		end: string
		start: string
		totalDates: number
	}
}

async function parseArgs(argv: string[]) {
	const flag = (name: string) => argv.find((_, i, a) => a[i - 1] === name) ?? '';

	let agency = flag('--agency');
	let start = flag('--start');
	let gtfsDir = flag('--gtfs');

	if (!agency || !start || !gtfsDir) {
		const rl = createInterface({ input: process.stdin, output: process.stdout });
		const today = new Date();
		const defaultStart = `${today.getFullYear()}0101`;

		if (!agency) agency = await rl.question('Agency ID: ');
		if (!start) {
			const ans = await rl.question(`Start date (YYYYMMDD) [${defaultStart}]: `);
			start = ans.trim() || defaultStart;
		}
		if (!gtfsDir) {
			const suggested = `../gtfs-exporter/output_${agency}`;
			const ans = await rl.question(`GTFS folder [${suggested}]: `);
			gtfsDir = ans.trim() || suggested;
		}

		rl.close();
	}

	return {
		agency,
		csv: flag('--csv'),
		gtfsDir,
		json: flag('--json'),
		limit: Number(flag('--limit') || '25'),
		onlyRouted: argv.includes('--only-routed'),
		start,
	};
}

function fmtKm(value: number) {
	return value.toLocaleString('en-GB', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function fmtInt(value: number) {
	return value.toLocaleString('en-GB');
}

async function loadAgencyPatterns(agencyId: string, onlyRouted: boolean): Promise<Pattern[]> {
	const agencyLines = await lines.findMany({ agency_id: agencyId }, { projection: { _id: 1 } });
	const lineIds = agencyLines.map(line => line._id);
	if (!lineIds.length) return [];

	const all = await patterns.findMany(
		{ line_id: { $in: lineIds } },
		{ projection: { code: 1, line_id: 1, path: 1, route_id: 1, rules: 1, shape: 1 } },
	);

	if (!onlyRouted) return all;

	const live = new Set(
		(await routes.findMany({ line_id: { $in: lineIds } }, { projection: { _id: 1 } })).map(r => r._id),
	);
	return all.filter(p => live.has(p.route_id));
}

function goTimepointDays(
	pattern: Pattern,
	operationalDates: OperationalDate[],
	periods: Awaited<ReturnType<typeof yearPeriods.findMany>>,
	holidaysList: Awaited<ReturnType<typeof holidays.findMany>>,
	eventsList: Awaited<ReturnType<typeof events.findMany>>,
) {
	const mergedRules = resolvePatternRules(pattern, eventsList);
	if (!mergedRules.length) return 0;

	let total = 0;
	for (const date of operationalDates) {
		const active = computeActiveRules(date, mergedRules, periods, holidaysList, { events: eventsList });
		total += active.timepoints.length;
	}
	return total;
}

function gtfsTripServiceDays(trips: GtfsTripEntry[], serviceDates: Map<string, Set<string>>) {
	let days = 0;
	let km = 0;

	for (const trip of trips) {
		const nDays = serviceDates.get(trip.serviceId)?.size ?? 0;
		if (!nDays) continue;
		days += nDays;
		km += trip.distanceKm * nDays;
	}

	return { days, km };
}

function gtfsUniqueOperatingDays(
	trips: GtfsTripEntry[],
	serviceDates: Map<string, Set<string>>,
	extensionKm: number,
) {
	const slots = buildGtfsOperatingSlots(trips, serviceDates);
	let days = 0;
	for (const timepoints of slots.values()) days += timepoints.size;
	return { days, km: days * extensionKm };
}

async function main() {
	const { agency, csv, gtfsDir, json, limit, onlyRouted, start } = await parseArgs(process.argv.slice(2));
	if (!gtfsDir) throw new Error('Missing --gtfs path to export folder');

	const startOp = start;
	const endOp = Dates.fromOperationalDate(start, 'Europe/Lisbon').plus({ years: 1 }).operational_date;
	const operationalDates = buildOperationalDateRange(
		Dates.fromOperationalDate(start, 'Europe/Lisbon').js_date,
		Dates.fromOperationalDate(endOp, 'Europe/Lisbon').js_date,
	);

	const resolvedGtfsDir = resolve(gtfsDir);
	const gtfsIndex = loadGtfsExportIndex(resolvedGtfsDir, startOp, endOp);

	const [agencyRecord, agencyPatterns, periods, holidaysList, eventsList] = await Promise.all([
		agencies.findById(agency),
		loadAgencyPatterns(agency, onlyRouted),
		yearPeriods.findMany({ agency_ids: { $in: [agency] } }),
		holidays.findMany({ agency_ids: { $in: [agency] } }),
		events.findMany({ agency_ids: { $in: [agency] } }),
	]);
	if (!agencyRecord) throw new Error(`Agency ${agency} not found`);

	const request: CalculateVkmDto = {
		agency_id: agency,
		calculation_method: 'rolling_year',
		end_date: null,
		extension_source: 'go',
		start_date: start as OperationalDate,
	};

	const vkmResult = calculateAgencyVkm({
		agency: agencyRecord,
		events: eventsList,
		holidays: holidaysList,
		patterns: agencyPatterns,
		periods,
		request,
	});

	const rows: PatternRow[] = [];
	let totalGoDays = 0;
	let totalGoKm = 0;
	let totalGtfsDays = 0;
	let totalGtfsKm = 0;
	let totalGtfsUniqueDays = 0;
	let totalGtfsUniqueKm = 0;

	for (const pattern of agencyPatterns) {
		const code = pattern.code;
		const extensionM = getPatternExtensionMeters(pattern, 'go');
		const extensionKm = extensionM / 1000;
		const goDays = extensionM
			? goTimepointDays(pattern, operationalDates, periods, holidaysList, eventsList)
			: 0;
		const goKm = goDays * extensionKm;

		const trips = gtfsIndex.tripsByPattern.get(code) ?? [];
		const { days: gtfsDays, km: gtfsKm } = gtfsTripServiceDays(trips, gtfsIndex.serviceDates);
		const { days: gtfsUniqueDays, km: gtfsUniqueKm } = gtfsUniqueOperatingDays(
			trips,
			gtfsIndex.serviceDates,
			extensionKm,
		);

		totalGoDays += goDays;
		totalGoKm += goKm;
		totalGtfsDays += gtfsDays;
		totalGtfsKm += gtfsKm;
		totalGtfsUniqueDays += gtfsUniqueDays;
		totalGtfsUniqueKm += gtfsUniqueKm;

		if (goDays === gtfsDays && goDays === gtfsUniqueDays) continue;

		const duplicateDays = gtfsDays - gtfsUniqueDays;
		const duplicateKm = gtfsKm - gtfsUniqueKm;

		rows.push({
			code,
			deltaDays: gtfsDays - goDays,
			deltaKm: gtfsKm - goKm,
			duplicateDays,
			duplicateKm,
			extensionKm,
			goDays,
			goKm,
			gtfsDays,
			gtfsKm,
			gtfsUniqueDays,
			gtfsUniqueKm,
		});
	}

	rows.sort((a, b) => Math.abs(b.deltaKm) - Math.abs(a.deltaKm));

	const deltaKm = totalGtfsKm - totalGoKm;
	const deltaDays = totalGtfsDays - totalGoDays;
	const duplicateDays = totalGtfsDays - totalGtfsUniqueDays;
	const duplicateKm = totalGtfsKm - totalGtfsUniqueKm;
	const ruleGapDays = totalGtfsUniqueDays - totalGoDays;
	const ruleGapKm = totalGtfsUniqueKm - totalGoKm;

	// ── Console output ──────────────────────────────────────────────────────────

	console.log('=== VKM + circulation summary (GO vs GTFS comparator) ===');
	console.log(`Agency ${agency}, window ${startOp}..${endOp} (${operationalDates.length} operational dates)`);
	console.log(`GTFS folder: ${resolvedGtfsDir}`);
	console.log(`Patterns${onlyRouted ? ' (routed only)' : ''}: ${agencyPatterns.length}`);
	console.log();

	console.log('Totals');
	console.log(`  GO VKM explorer (km):              ${fmtKm(vkmResult.total_from_distance)}`);
	console.log(`  GTFS comparator VKM (km):          ${fmtKm(totalGtfsKm)}`);
	console.log(`  Delta (GTFS − GO, km):             ${fmtKm(deltaKm)} (${((deltaKm / vkmResult.total_from_distance) * 100).toFixed(3)}%)`);
	console.log();

	console.log('Circulation volume');
	console.log(`  GO timepoint-days:                 ${fmtInt(totalGoDays)}`);
	console.log(`  GTFS trip-row service-days:        ${fmtInt(totalGtfsDays)}  ← gtfs-comparator counts these`);
	console.log(`  GTFS unique operating slot-days:   ${fmtInt(totalGtfsUniqueDays)}  ← deduped (date × timepoint)`);
	console.log(`  Delta service-days (GTFS − GO):    ${fmtInt(deltaDays)}`);
	console.log();

	console.log('Gap attribution (approximate)');
	console.log(`  Duplicate trip rows in export:     ${fmtInt(duplicateDays)} days, ${fmtKm(duplicateKm)} km`);
	console.log(`  Rule engine mismatch (unique−GO):  ${fmtInt(ruleGapDays)} days, ${fmtKm(ruleGapKm)} km`);
	console.log();

	if (rows.length) {
		console.log(`Top ${limit} patterns by |delta km| (GTFS comparator − GO):`);
		console.log('code          go_days  gtfs_days  uniq_days  dup_days  delta_km  dup_km  ext_km');
		for (const row of rows.slice(0, limit)) {
			console.log(
				`${row.code.padEnd(13)} ${String(row.goDays).padStart(8)} ${String(row.gtfsDays).padStart(10)} ${String(row.gtfsUniqueDays).padStart(10)} ${String(row.duplicateDays).padStart(9)} ${fmtKm(row.deltaKm).padStart(9)} ${fmtKm(row.duplicateKm).padStart(7)} ${row.extensionKm.toFixed(2).padStart(7)}`,
			);
		}
		console.log();

		// Actionable next step — emit the exact command to drill into the worst patterns
		const worstPatterns = rows.slice(0, Math.min(5, rows.length)).map(r => r.code).join(',');
		const gtfsArg = gtfsDir.startsWith('/') ? resolvedGtfsDir : gtfsDir;
		console.log('Alignment issues found. Run the per-pattern drill-down:');
		console.log();
		console.log(`  npm run vkm:dates -- --agency ${agency} --start ${start} --gtfs ${gtfsArg} \\`);
		console.log(`    --pattern ${worstPatterns}`);
		console.log();
		console.log('  Or for all patterns with delta:');
		console.log(`  npm run vkm:dates -- --agency ${agency} --start ${start} --gtfs ${gtfsArg} --all-with-delta`);
	} else {
		console.log('All patterns match. GO and GTFS export are aligned.');
	}
	console.log();

	// ── CSV output ──────────────────────────────────────────────────────────────

	if (csv) {
		const header = [
			'pattern',
			'extension_km',
			'go_days',
			'go_km',
			'gtfs_days',
			'gtfs_km',
			'gtfs_unique_days',
			'gtfs_unique_km',
			'delta_days',
			'delta_km',
			'duplicate_days',
			'duplicate_km',
		].join(',');

		const csvLines = rows.map(row => [
			row.code,
			row.extensionKm.toFixed(3),
			row.goDays,
			row.goKm.toFixed(2),
			row.gtfsDays,
			row.gtfsKm.toFixed(2),
			row.gtfsUniqueDays,
			row.gtfsUniqueKm.toFixed(2),
			row.deltaDays,
			row.deltaKm.toFixed(2),
			row.duplicateDays,
			row.duplicateKm.toFixed(2),
		].join(','));

		writeFileSync(csv, [header, ...csvLines].join('\n'));
		console.log(`CSV: ${rows.length} pattern rows written to ${csv}`);
	}

	// ── JSON output ─────────────────────────────────────────────────────────────

	if (json) {
		const report: SummaryReport = {
			agency,
			generatedAt: new Date().toISOString(),
			gtfsDir: resolvedGtfsDir,
			hasAlignmentIssues: rows.length > 0,
			patterns: rows,
			totals: {
				deltaKm,
				deltaPercent: (deltaKm / vkmResult.total_from_distance) * 100,
				duplicateDays,
				duplicateKm,
				goDays: totalGoDays,
				goKm: totalGoKm,
				gtfsDays: totalGtfsDays,
				gtfsKm: totalGtfsKm,
				gtfsUniqueDays: totalGtfsUniqueDays,
				gtfsUniqueKm: totalGtfsUniqueKm,
				ruleGapDays,
				ruleGapKm,
			},
			window: {
				end: endOp,
				start: startOp,
				totalDates: operationalDates.length,
			},
		};

		writeFileSync(json, JSON.stringify(report, null, 2));
		console.log(`JSON: report written to ${json}`);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
