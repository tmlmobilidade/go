/* * */

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

// Analysis grade translations
export const ANALYSIS_GRADE_TRANSLATIONS: Record<string, string> = {
	A: 'A',
	B: 'B',
	C: 'C',
	D: 'D',
	none: 'Nenhum',
};

// status system translations
export const SAMS_STATUS_SYSTEM_TRANSLATIONS: Record<string, string> = {
	complete: 'Completo',
	error: 'Erro',
	incomplete: 'Incompleto',
	waiting: 'Aguardando',
};

// Status translations
export const SAMS_STATUS_TRANSLATIONS: Record<string, string> = {
	complete: 'Completo',
	error: 'Erro',
	incomplete: 'Incompleto',
	waiting: 'Aguardando',
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
	if (key === 'analysis_simple_three_vehicle_events_grade' || key === 'analysis_ended_at_last_stop' || key === 'analysis_expected_apex_validation_interval' || key === 'analysis_transaction_sequentiality') {
		return ANALYSIS_GRADE_TRANSLATIONS[value] || value;
	}
	if (key === 'sams_status') {
		return SAMS_STATUS_TRANSLATIONS[value] || value;
	}
	return value;
}
