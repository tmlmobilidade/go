/* * */

import type { FeedbackEntityType } from './feedback-metrics';
import type { StackedResult } from '@/utils/metrics';
import type { PublicFeedback } from '@tmlmobilidade/types';

/* * */

export interface FeedbackReasonChartSlice {
	color: string
	id: string
	name: string
	value: number
}

export interface FeedbackReasonTrendChartData {
	chart: StackedResult['chart']
	series: StackedResult['series']
	sum: StackedResult['sum']
}

interface FeedbackReasonEntry {
	id: string
	name: string
	value: number
}

/* * */

const TOP_REASON_LIMIT = 6;

const FEEDBACK_REASON_CHART_COLORS = [
	'var(--chart-color-1)',
	'var(--chart-color-2)',
	'var(--chart-color-3)',
	'var(--chart-color-4)',
	'var(--chart-color-5)',
	'var(--color-system-text-300)',
];

const FEEDBACK_REASON_LABELS = new Map<string, string>([
	['accessibility_issue', 'Problema de acessibilidade'],
	['audio_announcement_issue', 'Problema nos anúncios sonoros'],
	['cancelled_departure', 'Circulação cancelada'],
	['climate_control_issue', 'Problema na climatização'],
	['confusing_signage', 'Sinalética confusa'],
	['damaged', 'Danificado'],
	['damaged_bench', 'Banco danificado'],
	['detour', 'Desvio no percurso'],
	['did_not_pass', 'Não passou'],
	['dirty', 'Sujo'],
	['disorganized_boarding', 'Embarque ou fila desorganizada'],
	['display_issue', 'Problema no painel'],
	['door_issue', 'Problema nas portas'],
	['driver_bad_conduct', 'Má conduta do motorista'],
	['early', 'Passou adiantado'],
	['elevator_escalator_issue', 'Problema no elevador ou escada rolante'],
	['excessive_travel_time', 'Tempo de viagem excessivo'],
	['inaccurate_realtime', 'Tempo real incorreto'],
	['inadequate_service', 'Serviço inadequado'],
	['insufficient_capacity', 'Capacidade insuficiente'],
	['interrupted', 'Serviço interrompido'],
	['lack_of_passenger_support', 'Falta de apoio ao passageiro'],
	['late', 'Passou atrasado'],
	['lighting_issue', 'Problema na iluminação'],
	['long_headway', 'Tempo de espera elevado'],
	['long_queue', 'Fila muito longa'],
	['missing_line_information', 'Informação de linhas em falta'],
	['missing_safety_equipment', 'Equipamento de segurança em falta'],
	['no_bench', 'Sem banco'],
	['no_reason', 'Sem motivo indicado'],
	['no_shelter', 'Sem abrigo'],
	['no_trash_bin', 'Sem caixote do lixo'],
	['other', 'Outro'],
	['route_changed_without_notice', 'Percurso alterado sem aviso'],
	['rude_staff', 'Atendimento rude'],
	['safety_incident', 'Incidente de segurança'],
	['shelter_issue', 'Problema no abrigo'],
	['sidewalk_issue', 'Problema no passeio'],
	['skipped_stop', 'Não parou na paragem'],
	['ticket_machine_issue', 'Problema na máquina de bilhetes'],
	['too_crowded', 'Muito cheio'],
	['traffic_law_violation', 'Infração de trânsito'],
	['unsafe_speed', 'Velocidade insegura'],
	['validator_issue', 'Problema no validador'],
	['weather_exposure_issue', 'Exposição ao mau tempo'],
	['wrong_panel_information', 'Informação errada no painel'],
]);

const FEEDBACK_REASON_DAY_DETAILED_FORMATTER = new Intl.DateTimeFormat('pt-PT', {
	day: '2-digit',
	month: 'long',
	timeZone: 'UTC',
	weekday: 'long',
	year: 'numeric',
});

const FEEDBACK_REASON_DAY_SHORT_FORMATTER = new Intl.DateTimeFormat('pt-PT', {
	day: '2-digit',
	month: '2-digit',
	timeZone: 'UTC',
	weekday: 'short',
});

/* * */

function getFeedbackReasonLabel(reason: string) {
	return FEEDBACK_REASON_LABELS.get(reason) ?? reason;
}

function getFeedbackReasonsForRow(row: PublicFeedback) {
	if (row.reasons.length === 0) return ['no_reason'];
	return Array.from(new Set(row.reasons));
}

function buildChartSlices(reasonEntries: FeedbackReasonEntry[]): FeedbackReasonChartSlice[] {
	return reasonEntries.map((reason, index) => ({
		...reason,
		color: FEEDBACK_REASON_CHART_COLORS[index % FEEDBACK_REASON_CHART_COLORS.length],
	}));
}

function getFeedbackDayKey(timestamp: number) {
	const date = new Date(timestamp);
	const year = date.getUTCFullYear();
	const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
	const day = `${date.getUTCDate()}`.padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function getDateFromDayKey(key: string) {
	const [year, month, day] = key.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

function getFormattedDayDetailed(key: string) {
	const label = FEEDBACK_REASON_DAY_DETAILED_FORMATTER.format(getDateFromDayKey(key));
	return label.charAt(0).toUpperCase() + label.slice(1);
}

function getFormattedDayShort(key: string) {
	const label = FEEDBACK_REASON_DAY_SHORT_FORMATTER.format(getDateFromDayKey(key));
	return label.charAt(0).toUpperCase() + label.slice(1);
}

function getSortedFeedbackReasonEntries(rows: PublicFeedback[], entityType: FeedbackEntityType): FeedbackReasonEntry[] {
	const reasonCounts = new Map<string, number>();

	for (const row of rows) {
		if (row.entity_type !== entityType) continue;

		for (const reason of getFeedbackReasonsForRow(row)) {
			reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
		}
	}

	return Array.from(reasonCounts.entries())
		.map(([id, value]) => ({
			id,
			name: getFeedbackReasonLabel(id),
			value,
		}))
		.sort((reasonA, reasonB) => reasonB.value - reasonA.value || reasonA.name.localeCompare(reasonB.name, 'pt-PT'));
}

function getVisibleFeedbackReasonEntries(reasonEntries: FeedbackReasonEntry[]) {
	return reasonEntries.slice(0, TOP_REASON_LIMIT);
}

function buildTrendPoint(dayKey: string, series: string[]) {
	return {
		day_detailed: getFormattedDayDetailed(dayKey),
		day_short: getFormattedDayShort(dayKey),
		total_qty: 0,
		...Object.fromEntries(series.map(seriesName => [seriesName, 0])),
	};
}

/* * */

export function getTopFeedbackReasonsByEntity(rows: PublicFeedback[], entityType: FeedbackEntityType): FeedbackReasonChartSlice[] {
	return buildChartSlices(getVisibleFeedbackReasonEntries(getSortedFeedbackReasonEntries(rows, entityType)));
}

export function getTopFeedbackReasonsTrendByEntity(rows: PublicFeedback[], entityType: FeedbackEntityType): FeedbackReasonTrendChartData {
	const reasonEntries = getSortedFeedbackReasonEntries(rows, entityType);
	const visibleReasonEntries = getVisibleFeedbackReasonEntries(reasonEntries);
	const topReasonNamesById = new Map(visibleReasonEntries.map(reason => [reason.id, reason.name]));
	const series = visibleReasonEntries.map(reason => reason.name);
	const chartByDay = new Map<string, Record<string, number | string | undefined>>();
	let sum = 0;

	for (const row of rows) {
		if (row.entity_type !== entityType) continue;

		const dayKey = getFeedbackDayKey(row.created_at);
		const trendPoint = chartByDay.get(dayKey) ?? buildTrendPoint(dayKey, series);

		for (const reason of getFeedbackReasonsForRow(row)) {
			const seriesName = topReasonNamesById.get(reason);
			if (!seriesName) continue;

			const currentValue = Number(trendPoint[seriesName] ?? 0);
			const currentTotal = Number(trendPoint.total_qty ?? 0);

			trendPoint[seriesName] = currentValue + 1;
			trendPoint.total_qty = currentTotal + 1;
			sum += 1;
		}

		chartByDay.set(dayKey, trendPoint);
	}

	const chart = Array.from(chartByDay.entries())
		.sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
		.map(([, point]) => point);

	return {
		chart,
		series,
		sum,
	};
}
