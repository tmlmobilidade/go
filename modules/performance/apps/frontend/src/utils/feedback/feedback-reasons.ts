/* * */

import type { FeedbackEntityType } from './feedback-metrics';
import type { PublicFeedback } from '@tmlmobilidade/types';

/* * */

export interface FeedbackReasonChartSlice {
	color: string
	id: string
	name: string
	value: number
}

/* * */

const TOP_REASON_LIMIT = 5;

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

/* * */

function getFeedbackReasonLabel(reason: string) {
	return FEEDBACK_REASON_LABELS.get(reason) ?? reason;
}

function getFeedbackReasonsForRow(row: PublicFeedback) {
	if (row.reasons.length === 0) return ['no_reason'];
	return Array.from(new Set(row.reasons));
}

function buildChartSlices(reasonEntries: { id: string, name: string, value: number }[]): FeedbackReasonChartSlice[] {
	return reasonEntries.map((reason, index) => ({
		...reason,
		color: FEEDBACK_REASON_CHART_COLORS[index % FEEDBACK_REASON_CHART_COLORS.length],
	}));
}

/* * */

export function getTopFeedbackReasonsByEntity(rows: PublicFeedback[], entityType: FeedbackEntityType): FeedbackReasonChartSlice[] {
	const reasonCounts = new Map<string, number>();

	for (const row of rows) {
		if (row.entity_type !== entityType) continue;

		for (const reason of getFeedbackReasonsForRow(row)) {
			reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
		}
	}

	const sortedReasons = Array.from(reasonCounts.entries())
		.map(([id, value]) => ({
			id,
			name: getFeedbackReasonLabel(id),
			value,
		}))
		.sort((reasonA, reasonB) => reasonB.value - reasonA.value || reasonA.name.localeCompare(reasonB.name, 'pt-PT'));

	if (sortedReasons.length <= TOP_REASON_LIMIT) return buildChartSlices(sortedReasons);

	const topReasons = sortedReasons.slice(0, TOP_REASON_LIMIT);
	const otherReasonsValue = sortedReasons.slice(TOP_REASON_LIMIT).reduce((total, reason) => total + reason.value, 0);

	return buildChartSlices([
		...topReasons,
		{
			id: 'other_reasons',
			name: 'Outros',
			value: otherReasonsValue,
		},
	]);
}
