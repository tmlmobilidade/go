/* * */

import { type GtfsSQLTables, importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs';
import { toFeatureFromObject, toLineStringFromPositions } from '@tmlmobilidade/geo';
import { Logger } from '@tmlmobilidade/logger';
import { type OperationalDate, type Plan } from '@tmlmobilidade/types';
import { type Feature, type LineString } from 'geojson';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import Papa from 'papaparse';

import {
	type CirculationGroupBreakdown,
	getExtractedGtfsDir,
	type PlanVkmResult,
	type VkmPerPatternStats,
} from './compute-plan-vkm.js';
import {
	computeMunicipalKmRawByPattern,
	computeStopsByMunicipality,
	loadShapefileSpatialInputs,
	type ShapefileSpatialInputs,
	type ShapeLineWithPattern,
} from './shapefile-inputs.js';

/* * */

export const MUNICIPIOS_DESEJADOS = [
	'Alcochete', 'Alenquer', 'Almada', 'Amadora', 'Arruda dos Vinhos', 'Barreiro',
	'Cascais', 'Lisboa', 'Loures', 'Mafra', 'Moita', 'Montijo', 'Odivelas', 'Oeiras',
	'Palmela', 'Seixal', 'Sesimbra', 'Setúbal', 'Sintra', 'Sobral de Monte Agraço',
	'Torres Vedras', 'Vendas Novas', 'Vila Franca de Xira',
] as const;

const AGENCY_AREA_LABEL: Record<string, string> = {
	41: 'A1',
	42: 'A2',
	43: 'A3',
	44: 'A4',
};

export interface ExtensionMunicipalityRow {
	area: string
	concelho: string
	extension_km: number
	extension_pct: number
	pattern_id: string
	total_extension_km: number
}

export interface ExtensionMunicipalityRedistRow extends ExtensionMunicipalityRow {
	redistribuicao: 'Não' | 'Sim'
}

export interface ParagensMunicipioRow {
	area: string
	pattern_id: string
	stopsCountByMunicipio: Map<string, number>
	totalStops: number
}

export interface Indice5050Row {
	area: string
	concelho: string
	extension_pct: number
	indice: number
	pattern_id: string
	stops_pct: number
}

export interface PlanInputUsed {
	analysisEnd: OperationalDate
	analysisStart: OperationalDate
	area: string
	calendarEndDate: OperationalDate
	calendarStartDate: OperationalDate
	feedVersion: null | string
	gtfsSource: string
	month: string
	planId: string
}

export interface MunicipalPlanData {
	area: string
	circulationGroups: (CirculationGroupBreakdown & { area: string })[]
	extensionRows: ExtensionMunicipalityRow[]
	inputUsed: PlanInputUsed
	paragensRows: ParagensMunicipioRow[]
	plan: Plan
	result: PlanVkmResult
	statsByPattern: Map<string, VkmPerPatternStats & { area: string, pattern_id: string }>
}

export interface MunicipalAggregates {
	allCirculationGroups: (CirculationGroupBreakdown & { area: string })[]
	allExtensionRows: ExtensionMunicipalityRow[]
	allInputsUsed: PlanInputUsed[]
	allParagensRows: ParagensMunicipioRow[]
	allStatsByPattern: Map<string, VkmPerPatternStats>
}

/* * */

export function agencyIdToArea(agencyId: string): string {
	const prefix = agencyId.slice(0, 2);

	return AGENCY_AREA_LABEL[prefix] ?? `A${prefix}`;
}

function patternStatsKey(area: string, patternId: string): string {
	return `${area}|${patternId}`;
}

function indiceRowKey(area: string, patternId: string, concelho: string): string {
	return `${area}|${patternId}|${concelho}`;
}

function formatOperationalMonth(operationalDate: OperationalDate): string {
	return `${operationalDate.slice(0, 4)}-${operationalDate.slice(4, 6)}`;
}

function buildImportConfig(): ImportGtfsToDatabaseConfig {
	return {};
}

async function parseCalendarValidityRangeFromFile(
	filePath: string,
): Promise<null | { end: OperationalDate, start: OperationalDate }> {
	if (!existsSync(filePath)) {
		return null;
	}

	const content = await readFile(filePath, 'utf-8');
	const parsed = Papa.parse<Record<string, string>>(content, { header: true, skipEmptyLines: true });
	const datesByService = new Map<string, Set<OperationalDate>>();

	for (const row of parsed.data) {
		if (!row.date) continue;

		const serviceId = String(row.service_id ?? '').trim();

		if (!serviceId) continue;

		const date = row.date.replaceAll('-', '') as OperationalDate;
		const exceptionType = String(row.exception_type ?? '1').trim();
		const serviceDates = datesByService.get(serviceId) ?? new Set<OperationalDate>();

		if (exceptionType === '2') {
			serviceDates.delete(date);
		} else {
			serviceDates.add(date);
		}

		datesByService.set(serviceId, serviceDates);
	}

	const activeDates = new Set<OperationalDate>();

	for (const serviceDates of datesByService.values()) {
		for (const date of serviceDates) {
			activeDates.add(date);
		}
	}

	if (activeDates.size === 0) {
		return null;
	}

	let start: null | OperationalDate = null;
	let end: null | OperationalDate = null;

	for (const date of activeDates) {
		if (start === null || date < start) start = date;
		if (end === null || date > end) end = date;
	}

	if (start === null || end === null) {
		return null;
	}

	return { end, start };
}

function buildPlanInputUsed(
	plan: Plan,
	analysisRange: { end: OperationalDate, start: OperationalDate },
	calendarRange: { end: OperationalDate, start: OperationalDate },
): PlanInputUsed {
	const agencyId = plan.gtfs_agency?.agency_id ?? '';

	return {
		analysisEnd: analysisRange.end,
		analysisStart: analysisRange.start,
		area: agencyIdToArea(agencyId),
		calendarEndDate: calendarRange.end,
		calendarStartDate: calendarRange.start,
		feedVersion: plan.gtfs_feed_info.feed_version ?? null,
		gtfsSource: plan.operation_file_id,
		month: formatOperationalMonth(plan.gtfs_feed_info.feed_start_date),
		planId: plan._id,
	};
}

function reconcileMunicipalKm(
	rows: { concelho: string, km_raw: number }[],
	totalExtensionKm: number,
): { concelho: string, extension_km: number, extension_pct: number }[] {
	if (rows.length === 0) return [];

	const sumRaw = rows.reduce((sum, row) => sum + row.km_raw, 0);
	const factor = sumRaw > 0 ? totalExtensionKm / sumRaw : 0;

	const reconciled = rows.map(row => ({
		concelho: row.concelho,
		extension_km: row.km_raw * factor,
		extension_pct: 0,
	}));

	const diff = totalExtensionKm - reconciled.reduce((sum, row) => sum + row.extension_km, 0);

	if (Math.abs(diff) > 1e-9 && reconciled.length > 0) {
		let maxIdx = 0;

		for (let i = 1; i < reconciled.length; i++) {
			if (reconciled[i].extension_km > reconciled[maxIdx].extension_km) maxIdx = i;
		}

		reconciled[maxIdx].extension_km += diff;
	}

	for (const row of reconciled) {
		row.extension_pct = totalExtensionKm > 0 ? row.extension_km / totalExtensionKm : 0;
	}

	return reconciled;
}

export function redistributeExtensionRows(
	extensionRows: ExtensionMunicipalityRow[],
	paragensRows: ParagensMunicipioRow[],
): ExtensionMunicipalityRedistRow[] {
	const stopCountsByPattern = new Map<string, Map<string, number>>();

	for (const parRow of paragensRows) {
		stopCountsByPattern.set(`${parRow.area}|${parRow.pattern_id}`, parRow.stopsCountByMunicipio);
	}

	const groups = new Map<string, ExtensionMunicipalityRow[]>();

	for (const row of extensionRows) {
		const key = `${row.area}|${row.pattern_id}`;
		const group = groups.get(key) ?? [];

		group.push(row);
		groups.set(key, group);
	}

	const result: ExtensionMunicipalityRedistRow[] = [];

	for (const [groupKey, groupRows] of groups) {
		const stopCounts = stopCountsByPattern.get(groupKey) ?? new Map<string, number>();
		const totalExtensionKm = groupRows[0]?.total_extension_km ?? 0;

		const working = groupRows.map((row) => {
			const stopCount = stopCounts.get(row.concelho) ?? 0;

			return {
				...row,
				extension_km_red: row.extension_km,
				stopCount,
			};
		});

		let donorSum = 0;
		let recipientWeightSum = 0;

		for (const row of working) {
			if (row.stopCount === 0 && row.extension_km > 0) {
				donorSum += row.extension_km;
			}

			if (row.stopCount > 0) {
				recipientWeightSum += row.stopCount;
			}
		}

		let houveRedistrib = false;

		if (donorSum > 0 && recipientWeightSum > 0) {
			houveRedistrib = true;

			for (const row of working) {
				if (row.stopCount === 0 && row.extension_km > 0) {
					row.extension_km_red = 0;
				} else if (row.stopCount > 0) {
					row.extension_km_red = row.extension_km + donorSum * (row.stopCount / recipientWeightSum);
				}
			}

			const diff = totalExtensionKm - working.reduce((sum, row) => sum + row.extension_km_red, 0);

			if (Math.abs(diff) > 1e-9 && working.length > 0) {
				let maxIdx = 0;

				for (let i = 1; i < working.length; i++) {
					if (working[i].extension_km_red > working[maxIdx].extension_km_red) maxIdx = i;
				}

				working[maxIdx].extension_km_red += diff;
			}
		}

		const redistribuicao = houveRedistrib ? 'Sim' as const : 'Não' as const;
		const outputRows = houveRedistrib
			? working.filter(row => row.extension_km_red > 1e-12)
			: working;

		for (const row of outputRows) {
			result.push({
				area: row.area,
				concelho: row.concelho,
				extension_km: row.extension_km_red,
				extension_pct: totalExtensionKm > 0 ? row.extension_km_red / totalExtensionKm : 0,
				pattern_id: row.pattern_id,
				redistribuicao,
				total_extension_km: totalExtensionKm,
			});
		}
	}

	return result;
}

function buildPatternTotalsFromResult(
	result: PlanVkmResult,
	agencyId: string,
): Map<string, { agency_id: string, extension_km: number }> {
	const patternTotals = new Map<string, { agency_id: string, extension_km: number }>();

	for (const [patternId, stats] of result.statsByPattern) {
		patternTotals.set(patternId, {
			agency_id: agencyId,
			extension_km: stats.extension_km,
		});
	}

	return patternTotals;
}

async function getShapeIdToPatternIdFromExtracted(planId: string): Promise<Map<string, string>> {
	const tripsPath = join(getExtractedGtfsDir(planId), 'trips.txt');
	const shapeIdToPatternId = new Map<string, string>();

	if (!existsSync(tripsPath)) {
		return shapeIdToPatternId;
	}

	const content = await readFile(tripsPath, 'utf-8');

	for (const row of Papa.parse<Record<string, string>>(content, { header: true, skipEmptyLines: true }).data) {
		const shapeId = row.shape_id ?? '';
		const patternId = row.pattern_id ?? '';

		if (!shapeId || !patternId || shapeIdToPatternId.has(shapeId)) continue;

		shapeIdToPatternId.set(shapeId, patternId);
	}

	return shapeIdToPatternId;
}

function loadShapeLine(gtfs: GtfsSQLTables, shapeId: string): Feature<LineString> | null {
	const points = gtfs._db.prepare(`
		SELECT shape_pt_lat, shape_pt_lon
		FROM shapes
		WHERE shape_id = ?
		ORDER BY shape_pt_sequence
	`).all(shapeId) as { shape_pt_lat: number, shape_pt_lon: number }[];

	if (points.length < 2) return null;

	return toFeatureFromObject(
		toLineStringFromPositions(points.map(p => [p.shape_pt_lon, p.shape_pt_lat])),
	);
}

function loadAllShapeLinesWithPattern(
	gtfs: GtfsSQLTables,
	shapeIdToPatternId: Map<string, string>,
): ShapeLineWithPattern[] {
	const shapeLines: ShapeLineWithPattern[] = [];

	for (const [shapeId, patternId] of shapeIdToPatternId) {
		const line = loadShapeLine(gtfs, shapeId);

		if (!line) continue;

		shapeLines.push({
			line,
			pattern_id: patternId,
			shape_id: shapeId,
		});
	}

	return shapeLines;
}

async function computeExtensionPerMunicipalityRows(
	gtfs: GtfsSQLTables,
	planId: string,
	spatialInputs: ShapefileSpatialInputs,
	patternTotals: Map<string, { agency_id: string, extension_km: number }>,
): Promise<ExtensionMunicipalityRow[]> {
	const shapeIdToPatternId = await getShapeIdToPatternIdFromExtracted(planId);
	const shapeLines = loadAllShapeLinesWithPattern(gtfs, shapeIdToPatternId);
	const kmRawByPattern = computeMunicipalKmRawByPattern(shapeLines, spatialInputs);
	const rows: ExtensionMunicipalityRow[] = [];

	let processed = 0;
	let skippedNoGeometry = 0;

	for (const [patternId, { agency_id: agencyId, extension_km: totalExtensionKm }] of patternTotals) {
		const kmRawMap = kmRawByPattern.get(patternId);

		if (!kmRawMap || kmRawMap.size === 0) {
			skippedNoGeometry++;
			continue;
		}

		const reconciled = reconcileMunicipalKm(
			[...kmRawMap.entries()].map(([concelho, kmRaw]) => ({ concelho, km_raw: kmRaw })),
			totalExtensionKm,
		);

		const area = agencyIdToArea(agencyId);

		for (const row of reconciled) {
			if (!spatialInputs.desiredConcelhos.has(row.concelho)) continue;

			rows.push({
				area,
				concelho: row.concelho,
				extension_km: row.extension_km,
				extension_pct: row.extension_pct,
				pattern_id: patternId,
				total_extension_km: totalExtensionKm,
			});
		}

		processed++;

		if (processed % 100 === 0) {
			Logger.info(`Extension per municipality: ${processed}/${patternTotals.size} patterns`);
		}
	}

	Logger.info(
		`Extension per municipality rows: ${rows.length} (${processed} patterns, ${skippedNoGeometry} skipped without geometry, ${shapeLines.length} shape lines)`,
	);

	return rows;
}

function getPatternStops(gtfs: GtfsSQLTables): Map<string, { agency_id: string, stops: { stop_lat: number, stop_lon: number }[] }> {
	const rows = gtfs._db.prepare(`
		SELECT DISTINCT
			t.pattern_id AS pattern_id,
			r.agency_id AS agency_id,
			st.stop_id AS stop_id,
			st.stop_sequence AS stop_sequence,
			CAST(s.stop_lat AS REAL) AS stop_lat,
			CAST(s.stop_lon AS REAL) AS stop_lon
		FROM stop_times st
		INNER JOIN trips t ON t.trip_id = st.trip_id
		INNER JOIN routes r ON r.route_id = t.route_id
		INNER JOIN stops s ON s.stop_id = st.stop_id
		WHERE s.stop_lat IS NOT NULL AND s.stop_lon IS NOT NULL
	`).all() as {
		agency_id: string
		pattern_id: string
		stop_id: string
		stop_lat: number
		stop_lon: number
		stop_sequence: number
	}[];

	const patternStops = new Map<string, { agency_id: string, stops: { stop_lat: number, stop_lon: number }[] }>();
	const seen = new Set<string>();

	for (const row of rows) {
		const dedupeKey = `${row.pattern_id}|${row.stop_id}|${row.stop_sequence}`;

		if (seen.has(dedupeKey)) continue;

		seen.add(dedupeKey);

		const entry = patternStops.get(row.pattern_id) ?? {
			agency_id: row.agency_id,
			stops: [],
		};

		entry.stops.push({ stop_lat: row.stop_lat, stop_lon: row.stop_lon });
		patternStops.set(row.pattern_id, entry);
	}

	return patternStops;
}

function computeParagensProMunicipioRows(
	gtfs: GtfsSQLTables,
	spatialInputs: ShapefileSpatialInputs,
): ParagensMunicipioRow[] {
	const patternStops = getPatternStops(gtfs);
	const rows: ParagensMunicipioRow[] = [];

	for (const [patternId, { agency_id: agencyId, stops }] of patternStops) {
		const { municipalityCounts, totalStops } = computeStopsByMunicipality(stops, spatialInputs);
		const stopsCountByMunicipio = new Map<string, number>();

		for (const municipio of MUNICIPIOS_DESEJADOS) {
			stopsCountByMunicipio.set(municipio, municipalityCounts.get(municipio) ?? 0);
		}

		rows.push({
			area: agencyIdToArea(agencyId),
			pattern_id: patternId,
			stopsCountByMunicipio,
			totalStops,
		});
	}

	Logger.info(`Paragens por município: ${rows.length} patterns`);

	return rows;
}

export function buildIndice5050Rows(
	extensionRows: ExtensionMunicipalityRow[],
	paragensRows: ParagensMunicipioRow[],
): Indice5050Row[] {
	const extensionByKey = new Map<string, number>();

	for (const row of extensionRows) {
		extensionByKey.set(indiceRowKey(row.area, row.pattern_id, row.concelho), row.extension_pct);
	}

	const stopsByKey = new Map<string, number>();

	for (const row of paragensRows) {
		for (const municipio of MUNICIPIOS_DESEJADOS) {
			const count = row.stopsCountByMunicipio.get(municipio) ?? 0;
			const stopsPct = row.totalStops > 0 ? count / row.totalStops : 0;

			stopsByKey.set(indiceRowKey(row.area, row.pattern_id, municipio), stopsPct);
		}
	}

	const allKeys = new Set([...extensionByKey.keys(), ...stopsByKey.keys()]);
	const indiceRows: Indice5050Row[] = [];

	for (const key of allKeys) {
		const stopsPct = stopsByKey.get(key) ?? 0;
		const extensionPct = extensionByKey.get(key) ?? 0;

		if (Math.abs(stopsPct) <= 1e-12 && Math.abs(extensionPct) <= 1e-12) continue;

		const [area, patternId, concelho] = key.split('|');

		indiceRows.push({
			area,
			concelho,
			extension_pct: extensionPct,
			indice: 0.5 * stopsPct + 0.5 * extensionPct,
			pattern_id: patternId,
			stops_pct: stopsPct,
		});
	}

	indiceRows.sort((a, b) => {
		const areaCmp = a.area.localeCompare(b.area);

		if (areaCmp !== 0) return areaCmp;

		const patternCmp = a.pattern_id.localeCompare(b.pattern_id);

		if (patternCmp !== 0) return patternCmp;

		return a.concelho.localeCompare(b.concelho);
	});

	return indiceRows;
}

export function computeVkmPorMunicipioRows(
	indiceRows: Indice5050Row[],
	statsByPattern: Map<string, VkmPerPatternStats>,
): { concelho: string, vkmTotal: number }[] {
	const vkmByConcelho = new Map<string, number>();

	for (const row of indiceRows) {
		const veicKmTotal = statsByPattern.get(patternStatsKey(row.area, row.pattern_id))?.vkm_km ?? 0;
		const valor5050XVeicKm = row.indice * veicKmTotal;

		vkmByConcelho.set(
			row.concelho,
			(vkmByConcelho.get(row.concelho) ?? 0) + valor5050XVeicKm,
		);
	}

	return [...vkmByConcelho.entries()]
		.map(([concelho, vkmTotal]) => ({ concelho, vkmTotal }))
		.sort((a, b) => a.concelho.localeCompare(b.concelho));
}

export async function computeMunicipalPlanData(
	plan: Plan,
	result: PlanVkmResult,
	spatialInputs: ShapefileSpatialInputs,
): Promise<MunicipalPlanData> {
	const agencyId = plan.gtfs_agency?.agency_id ?? '';
	const area = agencyIdToArea(agencyId);
	const gtfs = await importGtfsToDatabase(plan, buildImportConfig());
	const patternTotals = buildPatternTotalsFromResult(result, agencyId);
	const extensionRows = await computeExtensionPerMunicipalityRows(gtfs, plan._id, spatialInputs, patternTotals);
	const paragensRows = computeParagensProMunicipioRows(gtfs, spatialInputs);
	const calendarRange = await parseCalendarValidityRangeFromFile(join(getExtractedGtfsDir(plan._id), 'calendar_dates.txt'))
		?? result.analysisRange;

	const statsByPattern = new Map<string, VkmPerPatternStats & { area: string, pattern_id: string }>();

	for (const [patternId, stats] of result.statsByPattern) {
		statsByPattern.set(patternStatsKey(area, patternId), {
			...stats,
			area,
			pattern_id: patternId,
		});
	}

	const circulationGroups = result.circulationGroups.map(group => ({ ...group, area }));

	return {
		area,
		circulationGroups,
		extensionRows,
		inputUsed: buildPlanInputUsed(plan, result.analysisRange, calendarRange),
		paragensRows,
		plan,
		result,
		statsByPattern,
	};
}

export async function aggregateMunicipalPlanData(planDataList: MunicipalPlanData[]): Promise<MunicipalAggregates> {
	const allExtensionRows: ExtensionMunicipalityRow[] = [];
	const allParagensRows: ParagensMunicipioRow[] = [];
	const allStatsByPattern = new Map<string, VkmPerPatternStats>();
	const allCirculationGroups: (CirculationGroupBreakdown & { area: string })[] = [];
	const allInputsUsed: PlanInputUsed[] = [];

	for (const planData of planDataList) {
		allExtensionRows.push(...planData.extensionRows);
		allParagensRows.push(...planData.paragensRows);
		allInputsUsed.push(planData.inputUsed);

		for (const [key, stats] of planData.statsByPattern) {
			allStatsByPattern.set(key, stats);
		}

		allCirculationGroups.push(...planData.circulationGroups);
	}

	return {
		allCirculationGroups,
		allExtensionRows,
		allInputsUsed,
		allParagensRows,
		allStatsByPattern,
	};
}

export async function loadMunicipalSpatialInputs(): Promise<ShapefileSpatialInputs> {
	return loadShapefileSpatialInputs(MUNICIPIOS_DESEJADOS);
}

export { patternStatsKey };
