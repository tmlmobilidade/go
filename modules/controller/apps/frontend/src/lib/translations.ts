import { GtfsCauseExtended, GtfsEffect } from '@tmlmobilidade/types';

export const Translations: { CAUSE: Record<GtfsCauseExtended, string>, EFFECT: Record<GtfsEffect, string> } = {
	CAUSE: {
		ACCIDENT: 'Acidente',
		CONSTRUCTION: 'Obras',
		DEMONSTRATION: 'Evento / Manifestação',
		DRIVER_ABSENCE: 'Condutor Ausente',
		DRIVER_ISSUE: 'Condutor com Problema',
		HIGH_PASSENGER_LOAD: 'Elevado Volume de Passageiros',
		HOLIDAY: 'Feriado',
		MAINTENANCE: 'Manutenção',
		MEDICAL_EMERGENCY: 'Emergência Médica',
		POLICE_ACTIVITY: 'Atividade Policial',
		ROAD_INCIDENT: 'Incidente na Estrada',
		STRIKE: 'Greve',
		SYSTEM_FAILURE: 'Falha do Sistema',
		TECHNICAL_PROBLEM: 'Problema Técnico',
		TRAFFIC_JAM: 'Congestão de Trânsito',
		VEHICLE_ISSUE: 'Veículo com Problema',
		WEATHER: 'Mau Tempo',
	},
	EFFECT: {
		ACCESSIBILITY_ISSUE: 'Impacto na Acessibilidade',
		ADDITIONAL_SERVICE: 'Aumento de Serviço',
		DETOUR: 'Desvio',
		MODIFIED_SERVICE: 'Alteração de Horários',
		NO_SERVICE: 'Serviço Cancelado',
		REDUCED_SERVICE: 'Serviço Reduzido',
		SIGNIFICANT_DELAYS: 'Atrasos Significativos',
		STOP_MOVED: 'Paragem Deslocada',
	},
};

/* * */

import { AcceptanceStatusProps } from '@/components/common/AcceptanceStatusTag';

/* * */

// Filter key translations
export const FILTER_KEY_TRANSLATIONS: Record<string, string> = {
	acceptance_status: 'Aceitação',
	agency: 'Operador',
	analysis_ended_at_last_stop: 'Análise - Last Stop',
	analysis_expected_apex_validation_interval: 'Análise - Validações APEX (Int.)',
	analysis_simple_three_vehicle_events_grade: 'Análise - 3 Momentos',
	analysis_transaction_sequentiality: 'Análise - Sequencialidade',
	delay_status: 'Atraso',
	operational_status: 'Estado',
};

// Operational status translations
export const OPERATIONAL_STATUS_TRANSLATIONS: Record<string, string> = {
	ended: 'Finalizada',
	missed: 'Não realizada',
	running: 'Em execução',
	scheduled: 'Agendada',
};

// Delay status translations
export const DELAY_STATUS_TRANSLATIONS: Record<string, string> = {
	delayed: 'Atrasada',
	early: 'Adiantada',
	ontime: 'Pontual',
};

// Acceptance status translations
export const ACCEPTANCE_STATUS_TRANSLATIONS: Record<string, string> = {
	accepted: AcceptanceStatusProps.accepted.label,
	justification_required: AcceptanceStatusProps.justification_required.label,
	none: 'Nenhum',
	rejected: AcceptanceStatusProps.rejected.label,
	under_review: AcceptanceStatusProps.under_review.label,
};

// Analysis grade translations
export const ANALYSIS_GRADE_TRANSLATIONS: Record<string, string> = {
	A: 'A',
	B: 'B',
	C: 'C',
	D: 'D',
	none: 'Nenhum',
};

/* * */

export function translateFilterKey(key: string): string {
	return FILTER_KEY_TRANSLATIONS[key] || key;
}

export function translateFilterValue(key: string, value: string): string {
	if (key === 'operational_status') {
		return OPERATIONAL_STATUS_TRANSLATIONS[value] || value;
	}
	if (key === 'delay_status') {
		return DELAY_STATUS_TRANSLATIONS[value] || value;
	}
	if (key === 'acceptance_status') {
		return ACCEPTANCE_STATUS_TRANSLATIONS[value] || value;
	}
	if (key === 'analysis_simple_three_vehicle_events_grade' || key === 'analysis_ended_at_last_stop' || key === 'analysis_expected_apex_validation_interval' || key === 'analysis_transaction_sequentiality') {
		return ANALYSIS_GRADE_TRANSLATIONS[value] || value;
	}
	return value;
}
