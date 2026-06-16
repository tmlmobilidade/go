export interface FeedbackReasonGroup {
	heading: string
	options: readonly FeedbackReasonOption[]
}

export interface FeedbackReasonOption {
	label: string
	value: string
}

/* * */

export const FEEDBACK_LINE_REASON_GROUPS = {
	line_service: {
		heading: 'Linha/serviço',
		options: [
			{ label: 'Passou adiantado', value: 'early' },
			{ label: 'Passou atrasado', value: 'late' },
			{ label: 'Desvio no percurso', value: 'detour' },
			{ label: 'Tempo de espera elevado', value: 'long_headway' },
			{ label: 'Muito cheio', value: 'too_crowded' },
			{ label: 'Circulação cancelada', value: 'cancelled_departure' },
			{ label: 'Fila muito longa', value: 'long_queue' },
			{ label: 'Serviço interrompido', value: 'interrupted' },
			{ label: 'Tempo real incorreto', value: 'inaccurate_realtime' },
			{ label: 'Informação errada no painel', value: 'wrong_panel_information' },
			{ label: 'Não passou', value: 'did_not_pass' },
			{ label: 'Percurso alterado sem aviso', value: 'route_changed_without_notice' },
			{ label: 'Não parou na paragem', value: 'skipped_stop' },
			{ label: 'Serviço inadequado', value: 'inadequate_service' },
			{ label: 'Outro', value: 'other' },
		],
	},
	support: {
		heading: 'Atendimento',
		options: [
			{ label: 'Falta de apoio ao passageiro', value: 'lack_of_passenger_support' },
			{ label: 'Atendimento rude', value: 'rude_staff' },
			{ label: 'Má conduta do motorista', value: 'driver_bad_conduct' },
			{ label: 'Embarque desorganizado', value: 'disorganized_boarding' },
			{ label: 'Outro', value: 'other' },
		],
	},
	vehicle: {
		heading: 'Veículo',
		options: [
			{ label: 'Veículo danificado', value: 'damaged' },
			{ label: 'Veículo sujo', value: 'dirty' },
			{ label: 'Equipamento de segurança em falta', value: 'missing_safety_equipment' },
			{ label: 'Problema nas portas', value: 'door_issue' },
			{ label: 'Problema na climatização', value: 'climate_control_issue' },
			{ label: 'Problema no validador', value: 'validator_issue' },
			{ label: 'Problema de acessibilidade', value: 'accessibility_issue' },
			{ label: 'Problema na iluminação', value: 'lighting_issue' },
			{ label: 'Velocidade insegura', value: 'unsafe_speed' },
			{ label: 'Infração de trânsito', value: 'traffic_law_violation' },
			{ label: 'Outro', value: 'other' },
		],
	},
} as const satisfies Record<string, FeedbackReasonGroup>;

/* * */

export const FEEDBACK_STOP_REASON_GROUPS = {
	stop: {
		heading: 'Paragem',
		options: [
			{ label: 'Sem banco', value: 'no_bench' },
			{ label: 'Sem abrigo', value: 'no_shelter' },
			{ label: 'Problema na iluminação', value: 'lighting_issue' },
			{ label: 'Informação de linhas em falta', value: 'missing_line_information' },
			{ label: 'Paragem suja', value: 'dirty' },
			{ label: 'Informação de linhas errada', value: 'wrong_line_information' },
			{ label: 'Problema na máquina de bilhetes', value: 'ticket_machine_issue' },
			{ label: 'Fila desorganizada', value: 'disorganized_queue' },
			{ label: 'Problema de acessibilidade', value: 'accessibility_issue' },
			{ label: 'Problema no validador', value: 'validator_issue' },
			{ label: 'Sinalética confusa', value: 'confusing_signage' },
			{ label: 'Outro', value: 'other' },
		],
	},
} as const satisfies Record<string, FeedbackReasonGroup>;

/* * */

export const FEEDBACK_REASON_GROUPS = {
	line: FEEDBACK_LINE_REASON_GROUPS,
	stop: FEEDBACK_STOP_REASON_GROUPS,
} as const;

/* * */

export type FeedbackEntityType = keyof typeof FEEDBACK_REASON_GROUPS;
export type FeedbackReasonCategory = keyof typeof FEEDBACK_LINE_REASON_GROUPS | keyof typeof FEEDBACK_STOP_REASON_GROUPS;

/* * */

export function getFeedbackReasonGroups(entityType: FeedbackEntityType): Record<string, FeedbackReasonGroup> {
	return FEEDBACK_REASON_GROUPS[entityType];
}
