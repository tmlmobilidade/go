/* * */

import { Logger } from '@tmlmobilidade/logger';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Papa from 'papaparse';

import { type CirculationGroupBreakdown, type PlanVkmResult, type VkmPerPatternStats } from './compute-plan-vkm.js';
import {
	aggregateMunicipalPlanData,
	buildIndice5050Rows,
	computeMunicipalPlanData,
	computeVkmPorMunicipioRows,
	type ExtensionMunicipalityRedistRow,
	type ExtensionMunicipalityRow,
	type Indice5050Row,
	loadMunicipalSpatialInputs,
	MUNICIPIOS_DESEJADOS,
	type MunicipalAggregates,
	type ParagensMunicipioRow,
	type PlanInputUsed,
	redistributeExtensionRows,
} from './municipal-stats.js';

/* * */

const DEFAULT_OUTPUT_DIR = fileURLToPath(new URL('../output', import.meta.url));

/** Always under plan-stats/output/ unless PLAN_STATS_OUTPUT_DIR is set. */
export const OUTPUT_DIR = resolve(process.env.PLAN_STATS_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR);

const EXTENSION_PER_MUNICIPALITY_HEADERS = [
	'Area',
	'pattern_id',
	'Concelho',
	'extension_km',
	'total_extension_km',
	'extension_%',
	'total_extension_%',
] as const;

const EXTENSION_PER_MUNICIPALITY_REDIST_HEADERS = [
	...EXTENSION_PER_MUNICIPALITY_HEADERS,
	'redistribuicao',
] as const;

const PARAGENS_PRO_MUNICIPIO_HEADERS = [
	'Area',
	'pattern_id',
	...MUNICIPIOS_DESEJADOS,
	'Grand Total',
	...MUNICIPIOS_DESEJADOS.map(municipio => `${municipio} (%)`),
	'Grand Total (%)',
] as const;

const INDICE_50_50_HEADERS = [
	'Area',
	'pattern_id',
	'Concelho',
	'stops_%',
	'extension_%',
	'Indice_50_50',
] as const;

const INDICE_50_50_X_VEIC_KM_HEADERS = [
	'Area',
	'pattern_id',
	'Concelho',
	'Indice_50_50',
	'veic_km_total',
	'Valor_50_50_x_veic_km',
] as const;

const VKM_P_MUNICIPIO_HEADERS = [
	'Concelho',
	'VKM_total',
] as const;

const INPUTS_USADOS_HEADERS = [
	'Resumo',
] as const;

const TESTE_HEADERS = [
	'row_type',
	'Area',
	'pattern_id',
	'service_id',
	'period',
	'day_type',
	'num_trip_ids',
	'num_dates',
	'runs',
	'extension_km',
	'annual_circulations',
	'num_trips',
	'veic_km_total',
	'nota',
] as const;

export interface PlanVkmRow {
	agency_id: string
	area: string
	feed_end_date: string
	feed_start_date: string
	plan: import('@tmlmobilidade/types').Plan
	result: PlanVkmResult
}

/* * */

function formatNumber(value: number): string {
	return String(value);
}

function formatKm(km: number): string {
	return formatNumber(km);
}

function formatPercent(value: number): string {
	return `${formatNumber(value)}%`;
}

function buildInputsUsadosResumoLines(inputs: PlanInputUsed[]): string[] {
	const lines: string[] = [];

	for (const input of inputs) {
		lines.push(input.area);
		lines.push(`plan_id: ${input.planId}`);
		lines.push(`mes: ${input.month}`);
		lines.push(`calendar: ${input.calendarStartDate} a ${input.calendarEndDate}`);
		lines.push(`periodo analise: ${input.analysisStart} a ${input.analysisEnd}`);
		lines.push(`gtfs: ${input.gtfsSource}`);
		lines.push('');
	}

	return lines;
}

async function writeExtensionPerMunicipalitySheet(
	extensionRows: ExtensionMunicipalityRow[],
	outputDir: string,
): Promise<string> {
	const sheetRows: Record<(typeof EXTENSION_PER_MUNICIPALITY_HEADERS)[number], string>[] = extensionRows.map(row => ({
		'Area': row.area,
		'Concelho': row.concelho,
		'extension_%': formatPercent(row.extension_pct * 100),
		'extension_km': formatKm(row.extension_km),
		'pattern_id': row.pattern_id,
		'total_extension_%': formatPercent(100),
		'total_extension_km': formatKm(row.total_extension_km),
	}));

	sheetRows.sort((a, b) => {
		const areaCmp = a.Area.localeCompare(b.Area);

		if (areaCmp !== 0) return areaCmp;

		const patternCmp = a.pattern_id.localeCompare(b.pattern_id);

		if (patternCmp !== 0) return patternCmp;

		return Number.parseFloat(b.extension_km) - Number.parseFloat(a.extension_km);
	});

	const outputPath = join(outputDir, 'extension-per-municipality.csv');

	await writeFile(
		outputPath,
		Papa.unparse(sheetRows, { columns: [...EXTENSION_PER_MUNICIPALITY_HEADERS], delimiter: ';', header: true }),
		'utf-8',
	);

	return outputPath;
}

async function writeExtensionPerMunicipalityRedistSheet(
	extensionRows: ExtensionMunicipalityRedistRow[],
	outputDir: string,
): Promise<string> {
	const sheetRows: Record<(typeof EXTENSION_PER_MUNICIPALITY_REDIST_HEADERS)[number], string>[] = extensionRows.map(row => ({
		'Area': row.area,
		'Concelho': row.concelho,
		'extension_%': formatPercent(row.extension_pct * 100),
		'extension_km': formatKm(row.extension_km),
		'pattern_id': row.pattern_id,
		'redistribuicao': row.redistribuicao,
		'total_extension_%': formatPercent(100),
		'total_extension_km': formatKm(row.total_extension_km),
	}));

	sheetRows.sort((a, b) => {
		const areaCmp = a.Area.localeCompare(b.Area);

		if (areaCmp !== 0) return areaCmp;

		const patternCmp = a.pattern_id.localeCompare(b.pattern_id);

		if (patternCmp !== 0) return patternCmp;

		return Number.parseFloat(b.extension_km) - Number.parseFloat(a.extension_km);
	});

	const outputPath = join(outputDir, 'extension-per-municipality.csv');

	await writeFile(
		outputPath,
		Papa.unparse(sheetRows, { columns: [...EXTENSION_PER_MUNICIPALITY_REDIST_HEADERS], delimiter: ';', header: true }),
		'utf-8',
	);

	return outputPath;
}

async function writeParagensProMunicipioSheet(
	paragensRows: ParagensMunicipioRow[],
	outputDir: string,
): Promise<string> {
	const sheetRows: Record<string, string>[] = paragensRows.map((row) => {
		const csvRow: Record<string, string> = {
			'Area': row.area,
			'Grand Total': String(row.totalStops),
			'Grand Total (%)': formatPercent(100),
			'pattern_id': row.pattern_id,
		};

		for (const municipio of MUNICIPIOS_DESEJADOS) {
			const count = row.stopsCountByMunicipio.get(municipio) ?? 0;
			const pct = row.totalStops > 0 ? (count / row.totalStops) * 100 : 0;

			csvRow[municipio] = String(count);
			csvRow[`${municipio} (%)`] = formatPercent(pct);
		}

		return csvRow;
	});

	sheetRows.sort((a, b) => {
		const areaCmp = a.Area.localeCompare(b.Area);

		if (areaCmp !== 0) return areaCmp;

		return a.pattern_id.localeCompare(b.pattern_id);
	});

	const outputPath = join(outputDir, 'paragens-pro-municipio.csv');

	await writeFile(
		outputPath,
		Papa.unparse(sheetRows, { columns: [...PARAGENS_PRO_MUNICIPIO_HEADERS], delimiter: ';', header: true }),
		'utf-8',
	);

	return outputPath;
}

async function writeIndice5050Sheet(
	indiceRows: Indice5050Row[],
	outputDir: string,
): Promise<string> {
	const sheetRows: Record<(typeof INDICE_50_50_HEADERS)[number], string>[] = indiceRows.map(row => ({
		'Area': row.area,
		'Concelho': row.concelho,
		'extension_%': formatPercent(row.extension_pct * 100),
		'Indice_50_50': formatPercent(row.indice * 100),
		'pattern_id': row.pattern_id,
		'stops_%': formatPercent(row.stops_pct * 100),
	}));

	const outputPath = join(outputDir, 'indice-50-50.csv');

	await writeFile(
		outputPath,
		Papa.unparse(sheetRows, { columns: [...INDICE_50_50_HEADERS], delimiter: ';', header: true }),
		'utf-8',
	);

	return outputPath;
}

async function writeIndice5050XVeicKmSheet(
	indiceRows: Indice5050Row[],
	statsByPattern: Map<string, VkmPerPatternStats>,
	outputDir: string,
): Promise<string> {
	const sheetRows: Record<(typeof INDICE_50_50_X_VEIC_KM_HEADERS)[number], string>[] = indiceRows.map((row) => {
		const veicKmTotal = statsByPattern.get(`${row.area}|${row.pattern_id}`)?.vkm_km ?? 0;
		const valor5050XVeicKm = row.indice * veicKmTotal;

		return {
			Area: row.area,
			Concelho: row.concelho,
			Indice_50_50: formatPercent(row.indice * 100),
			pattern_id: row.pattern_id,
			Valor_50_50_x_veic_km: formatKm(valor5050XVeicKm),
			veic_km_total: formatKm(veicKmTotal),
		};
	});

	const outputPath = join(outputDir, 'indice-50-50-x-veic-km.csv');

	await writeFile(
		outputPath,
		Papa.unparse(sheetRows, { columns: [...INDICE_50_50_X_VEIC_KM_HEADERS], delimiter: ';', header: true }),
		'utf-8',
	);

	return outputPath;
}

async function writeVkmPorMunicipioSheet(
	indiceRows: Indice5050Row[],
	statsByPattern: Map<string, VkmPerPatternStats>,
	outputDir: string,
): Promise<string> {
	const municipalityRows = computeVkmPorMunicipioRows(indiceRows, statsByPattern);

	const sheetRows: Record<(typeof VKM_P_MUNICIPIO_HEADERS)[number], string>[] = municipalityRows.map(row => ({
		Concelho: row.concelho,
		VKM_total: formatKm(row.vkmTotal),
	}));

	const totalVkmKm = municipalityRows.reduce((sum, row) => sum + row.vkmTotal, 0);

	Logger.info(`VKM por município: ${sheetRows.length} concelhos, total ${formatKm(totalVkmKm)} km`);

	const outputPath = join(outputDir, 'vkm-p-municipio.csv');

	await writeFile(
		outputPath,
		Papa.unparse(sheetRows, { columns: [...VKM_P_MUNICIPIO_HEADERS], delimiter: ';', header: true }),
		'utf-8',
	);

	return outputPath;
}

async function writeInputsUsadosSheet(
	inputsUsed: PlanInputUsed[],
	outputDir: string,
): Promise<string> {
	const resumoLines = buildInputsUsadosResumoLines(inputsUsed);
	const sheetRows: Record<(typeof INPUTS_USADOS_HEADERS)[number], string>[] = resumoLines.map(line => ({
		Resumo: line,
	}));

	const outputPath = join(outputDir, 'inputs-usados.csv');

	await writeFile(
		outputPath,
		Papa.unparse(sheetRows, { columns: [...INPUTS_USADOS_HEADERS], delimiter: ';', header: true }),
		'utf-8',
	);

	return outputPath;
}

async function writeTesteSheet(
	statsByPattern: Map<string, VkmPerPatternStats>,
	circulationGroups: (CirculationGroupBreakdown & { area: string })[],
	outputDir: string,
): Promise<string> {
	const groupsByPattern = new Map<string, (CirculationGroupBreakdown & { area: string })[]>();

	for (const group of circulationGroups) {
		const key = `${group.area}|${group.pattern_id}`;
		const entries = groupsByPattern.get(key) ?? [];

		entries.push(group);
		groupsByPattern.set(key, entries);
	}

	const sheetRows: Record<(typeof TESTE_HEADERS)[number], string>[] = [];

	const patternKeys = [...statsByPattern.keys()].sort((a, b) => {
		const [areaA, patternA] = a.split('|');
		const [areaB, patternB] = b.split('|');
		const areaCmp = areaA.localeCompare(areaB);

		if (areaCmp !== 0) return areaCmp;

		return patternA.localeCompare(patternB);
	});

	for (const key of patternKeys) {
		const stats = statsByPattern.get(key);

		if (!stats) continue;

		const [area, patternId] = key.split('|');

		sheetRows.push({
			annual_circulations: String(stats.annual_circulations),
			Area: area,
			day_type: '',
			extension_km: formatKm(stats.extension_km),
			nota: `veic_km_total = extension_km × annual_circulations (${formatKm(stats.extension_km)} × ${stats.annual_circulations} = ${formatKm(stats.vkm_km)}); extension_km = MAX(shapes.txt shape_dist_traveled) por pattern (gtfs-comparator)`,
			num_dates: '',
			num_trip_ids: '',
			num_trips: String(stats.num_trips),
			pattern_id: patternId,
			period: '',
			row_type: 'pattern_summary',
			runs: '',
			service_id: '',
			veic_km_total: formatKm(stats.vkm_km),
		});

		const groups = (groupsByPattern.get(key) ?? []).sort((a, b) => {
			const periodCmp = a.period.localeCompare(b.period, undefined, { numeric: true });

			if (periodCmp !== 0) return periodCmp;

			const dayTypeCmp = a.day_type.localeCompare(b.day_type, undefined, { numeric: true });

			if (dayTypeCmp !== 0) return dayTypeCmp;

			return a.service_id.localeCompare(b.service_id, undefined, { numeric: true });
		});

		for (const group of groups) {
			sheetRows.push({
				annual_circulations: '',
				Area: group.area,
				day_type: group.day_type,
				extension_km: '',
				nota: group.runs > 0
					? 'runs = Σ (num_trip_ids × num_dates) per service_id for this period/day_type'
					: '',
				num_dates: String(group.num_dates),
				num_trip_ids: String(group.num_trip_ids),
				num_trips: '',
				pattern_id: group.pattern_id,
				period: group.period,
				row_type: 'circulation_group',
				runs: String(group.runs),
				service_id: group.service_id,
				veic_km_total: '',
			});
		}
	}

	const outputPath = join(outputDir, 'teste.csv');

	await writeFile(
		outputPath,
		Papa.unparse(sheetRows, { columns: [...TESTE_HEADERS], delimiter: ';', header: true }),
		'utf-8',
	);

	return outputPath;
}

async function writeAllOutputSheets(params: {
	aggregates: MunicipalAggregates
	extensionRows: ExtensionMunicipalityRedistRow[] | ExtensionMunicipalityRow[]
	indiceRows: Indice5050Row[]
	isRedist?: boolean
	outputDir: string
}): Promise<{
	extensionPerMunicipality: string
	indice5050: string
	indice5050XVeicKm: string
	inputsUsados: string
	paragensProMunicipio: string
	teste: string
	vkmPorMunicipio: string
}> {
	const {
		aggregates,
		extensionRows,
		indiceRows,
		isRedist = false,
		outputDir,
	} = params;

	await mkdir(outputDir, { recursive: true });

	const extensionPerMunicipality = isRedist
		? await writeExtensionPerMunicipalityRedistSheet(extensionRows as ExtensionMunicipalityRedistRow[], outputDir)
		: await writeExtensionPerMunicipalitySheet(extensionRows, outputDir);
	const paragensProMunicipio = await writeParagensProMunicipioSheet(aggregates.allParagensRows, outputDir);
	const indice5050 = await writeIndice5050Sheet(indiceRows, outputDir);
	const indice5050XVeicKm = await writeIndice5050XVeicKmSheet(indiceRows, aggregates.allStatsByPattern, outputDir);
	const vkmPorMunicipio = await writeVkmPorMunicipioSheet(indiceRows, aggregates.allStatsByPattern, outputDir);
	const inputsUsados = await writeInputsUsadosSheet(aggregates.allInputsUsed, outputDir);
	const teste = await writeTesteSheet(aggregates.allStatsByPattern, aggregates.allCirculationGroups, outputDir);

	return {
		extensionPerMunicipality,
		indice5050,
		indice5050XVeicKm,
		inputsUsados,
		paragensProMunicipio,
		teste,
		vkmPorMunicipio,
	};
}

export async function writeVkmOutputSheets(planRows: PlanVkmRow[]): Promise<void> {
	const spatialInputs = await loadMunicipalSpatialInputs();

	Logger.info(
		`Spatial inputs loaded: ${spatialInputs.allConcelhos.length} concelhos, ${spatialInputs.bridges.length} bridge polygon(s)`,
	);

	const municipalPlanDataList = [];

	for (const row of planRows) {
		municipalPlanDataList.push(await computeMunicipalPlanData(row.plan, row.result, spatialInputs));
	}

	const aggregates = await aggregateMunicipalPlanData(municipalPlanDataList);
	const indiceRows = buildIndice5050Rows(aggregates.allExtensionRows, aggregates.allParagensRows);
	const redistExtensionRows = redistributeExtensionRows(aggregates.allExtensionRows, aggregates.allParagensRows);
	const redistIndiceRows = buildIndice5050Rows(redistExtensionRows, aggregates.allParagensRows);

	const principalPaths = await writeAllOutputSheets({
		aggregates,
		extensionRows: aggregates.allExtensionRows,
		indiceRows,
		outputDir: OUTPUT_DIR,
	});

	const redistPaths = await writeAllOutputSheets({
		aggregates,
		extensionRows: redistExtensionRows,
		indiceRows: redistIndiceRows,
		isRedist: true,
		outputDir: join(OUTPUT_DIR, 'redist'),
	});

	Logger.success(`Principal outputs (7 files) written to ${OUTPUT_DIR}/`);
	Logger.success(`REDIST outputs (7 files) written to ${join(OUTPUT_DIR, 'redist')}/`);
	Logger.info(`Principal: ${Object.values(principalPaths).join(', ')}`);
	Logger.info(`REDIST: ${Object.values(redistPaths).join(', ')}`);
}

export { agencyIdToArea } from './municipal-stats.js';
