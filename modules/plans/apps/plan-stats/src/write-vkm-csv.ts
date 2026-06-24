/* * */

import { Logger } from '@tmlmobilidade/logger';
import { type Plan, type PlanStats } from '@tmlmobilidade/types';

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
	type ParagensMunicipioRow,
	type PlanInputUsed,
	redistributeExtensionRows,
} from './municipal-stats.js';

/* * */

export interface PlanVkmRow {
	agency_id: string
	area: string
	feed_end_date: string
	feed_start_date: string
	plan: Plan
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

function buildExtensionPerMunicipalityRows(
	extensionRows: ExtensionMunicipalityRow[],
): PlanStats['extension_per_municipality']['rows'] {
	const sheetRows: PlanStats['extension_per_municipality']['rows'] = extensionRows.map(row => ({
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

	return sheetRows;
}

function buildExtensionPerMunicipalityRedistRows(
	extensionRows: ExtensionMunicipalityRedistRow[],
): PlanStats['extension_per_municipality_redist']['rows'] {
	const sheetRows: PlanStats['extension_per_municipality_redist']['rows'] = extensionRows.map(row => ({
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

	return sheetRows;
}

function buildParagensProMunicipioRows(
	paragensRows: ParagensMunicipioRow[],
): PlanStats['paragens_pro_municipio']['rows'] {
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

	return sheetRows;
}

function buildIndice5050SheetRows(
	indiceRows: Indice5050Row[],
): PlanStats['indice_50_50']['rows'] {
	const sheetRows: PlanStats['indice_50_50']['rows'] = indiceRows.map(row => ({
		'Area': row.area,
		'Concelho': row.concelho,
		'extension_%': formatPercent(row.extension_pct * 100),
		'Indice_50_50': formatPercent(row.indice * 100),
		'pattern_id': row.pattern_id,
		'stops_%': formatPercent(row.stops_pct * 100),
	}));

	return sheetRows;
}

function buildIndice5050XVeicKmRows(
	indiceRows: Indice5050Row[],
	statsByPattern: Map<string, VkmPerPatternStats>,
): PlanStats['indice_50_50_x_veic_km']['rows'] {
	const sheetRows: PlanStats['indice_50_50_x_veic_km']['rows'] = indiceRows.map((row) => {
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

	return sheetRows;
}

function buildVkmPorMunicipioRows(
	indiceRows: Indice5050Row[],
	statsByPattern: Map<string, VkmPerPatternStats>,
): PlanStats['vkm_p_municipio']['rows'] {
	const municipalityRows = computeVkmPorMunicipioRows(indiceRows, statsByPattern);

	const sheetRows: PlanStats['vkm_p_municipio']['rows'] = municipalityRows.map(row => ({
		Concelho: row.concelho,
		VKM_total: formatKm(row.vkmTotal),
	}));

	const totalVkmKm = municipalityRows.reduce((sum, row) => sum + row.vkmTotal, 0);

	Logger.info(`VKM por município: ${sheetRows.length} concelhos, total ${formatKm(totalVkmKm)} km`);

	return sheetRows;
}

function buildInputsUsadosRows(
	inputsUsed: PlanInputUsed[],
): PlanStats['inputs_usados']['rows'] {
	const resumoLines = buildInputsUsadosResumoLines(inputsUsed);
	const sheetRows: PlanStats['inputs_usados']['rows'] = resumoLines.map(line => ({
		Resumo: line,
	}));

	return sheetRows;
}

function buildTesteRows(
	statsByPattern: Map<string, VkmPerPatternStats>,
	circulationGroups: (CirculationGroupBreakdown & { area: string })[],
): PlanStats['teste']['rows'] {
	const groupsByPattern = new Map<string, (CirculationGroupBreakdown & { area: string })[]>();

	for (const group of circulationGroups) {
		const key = `${group.area}|${group.pattern_id}`;
		const entries = groupsByPattern.get(key) ?? [];

		entries.push(group);
		groupsByPattern.set(key, entries);
	}

	const sheetRows: PlanStats['teste']['rows'] = [];

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

	return sheetRows;
}

let SPATIAL_INPUTS_PROMISE: null | ReturnType<typeof loadMunicipalSpatialInputs> = null;

async function getMunicipalSpatialInputs() {
	SPATIAL_INPUTS_PROMISE ??= loadMunicipalSpatialInputs().then((spatialInputs) => {
		Logger.info(
			`Spatial inputs loaded: ${spatialInputs.allConcelhos.length} concelhos, ${spatialInputs.bridges.length} bridge polygon(s)`,
		);

		return spatialInputs;
	});

	return SPATIAL_INPUTS_PROMISE;
}

export async function buildPlanStatsOutput(row: PlanVkmRow): Promise<PlanStats> {
	const spatialInputs = await getMunicipalSpatialInputs();
	const municipalPlanData = await computeMunicipalPlanData(row.plan, row.result, spatialInputs);
	const aggregates = await aggregateMunicipalPlanData([municipalPlanData]);
	const indiceRows = buildIndice5050Rows(aggregates.allExtensionRows, aggregates.allParagensRows);
	const redistExtensionRows = redistributeExtensionRows(aggregates.allExtensionRows, aggregates.allParagensRows);

	return {
		extension_per_municipality: {
			rows: buildExtensionPerMunicipalityRows(aggregates.allExtensionRows),
		},
		extension_per_municipality_redist: {
			rows: buildExtensionPerMunicipalityRedistRows(redistExtensionRows),
		},
		indice_50_50: {
			rows: buildIndice5050SheetRows(indiceRows),
		},
		indice_50_50_x_veic_km: {
			rows: buildIndice5050XVeicKmRows(indiceRows, aggregates.allStatsByPattern),
		},
		inputs_usados: {
			rows: buildInputsUsadosRows(aggregates.allInputsUsed),
		},
		paragens_pro_municipio: {
			rows: buildParagensProMunicipioRows(aggregates.allParagensRows),
		},
		teste: {
			rows: buildTesteRows(aggregates.allStatsByPattern, aggregates.allCirculationGroups),
		},
		vkm_p_municipio: {
			rows: buildVkmPorMunicipioRows(indiceRows, aggregates.allStatsByPattern),
		},
	};
}

export { agencyIdToArea } from './municipal-stats.js';
