/* * */

export const FEEDBACK_SUPPORT_AGENCY_IDS = ['1', '41', '42', '43', '44', 'CM'] as const;

/* * */

export type FeedbackEntityType = 'line' | 'stop';
export type FeedbackReasonCategory = 'driver' | 'line_service' | 'stop' | 'vehicle';
export interface FeedbackReasonConfig {
	agencies?: readonly string[]
	category: readonly FeedbackReasonCategory[]
	id: string
	name: string
	scope: readonly FeedbackEntityType[]
}

export interface FeedbackReasonGroup {
	heading: string
	options: FeedbackReasonOption[]
}

export interface FeedbackReasonOption {
	label: string
	value: string
}

export type FeedbackReasonGroups = Partial<Record<FeedbackReasonCategory, FeedbackReasonGroup>>;

/* * */

export const FEEDBACK_REASON_SELECTION_LIMIT = 4;

const CATEGORY_HEADINGS = {
	driver: 'Motorista/Condutor',
	line_service: 'Linha/Serviço',
	stop: 'Paragem',
	vehicle: 'Veículo',
} as const satisfies Record<FeedbackReasonCategory, string>;

const CATEGORIES = {
	line: ['driver', 'line_service', 'vehicle'],
	line_without_driver: ['line_service', 'vehicle'],
	stop: ['stop'],
} as const satisfies Record<string, readonly FeedbackReasonCategory[]>;

/* * */

export const feedbackConfig = [
	{
		category: ['line_service'],
		id: 'early',
		name: 'Passou adiantado',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'late',
		name: 'Passou atrasado',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'detour',
		name: 'Desvio no percurso',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'long_headway',
		name: 'Tempo de espera elevado',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'too_crowded',
		name: 'Muito cheio',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'insufficient_capacity',
		name: 'Capacidade insuficiente',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'cancelled_departure',
		name: 'Circulação cancelada',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'long_queue',
		name: 'Fila muito longa',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'interrupted',
		name: 'Serviço interrompido',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'inaccurate_realtime',
		name: 'Tempo real incorreto',
		scope: ['line'],
	},
	{
		category: ['line_service', 'stop'],
		id: 'wrong_panel_information',
		name: 'Informação errada no painel',
		scope: ['line', 'stop'],
	},
	{
		category: ['line_service', 'stop'],
		id: 'display_issue',
		name: 'Problema no painel',
		scope: ['line', 'stop'],
	},
	{
		category: ['line_service', 'stop'],
		id: 'audio_announcement_issue',
		name: 'Problema nos anúncios sonoros',
		scope: ['line', 'stop'],
	},
	{
		category: ['line_service'],
		id: 'did_not_pass',
		name: 'Não passou',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'route_changed_without_notice',
		name: 'Percurso alterado sem aviso',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'skipped_stop',
		name: 'Não parou na paragem',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'inadequate_service',
		name: 'Serviço inadequado',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'excessive_travel_time',
		name: 'Tempo de viagem excessivo',
		scope: ['line'],
	},
	{
		category: ['vehicle'],
		id: 'damaged',
		name: 'Danificado',
		scope: ['line'],
	},
	{
		category: ['vehicle', 'stop'],
		id: 'dirty',
		name: 'Sujo',
		scope: ['line', 'stop'],
	},
	{
		category: ['vehicle'],
		id: 'missing_safety_equipment',
		name: 'Equipamento de segurança em falta',
		scope: ['line'],
	},
	{
		category: ['vehicle'],
		id: 'door_issue',
		name: 'Problema nas portas',
		scope: ['line'],
	},
	{
		category: ['vehicle'],
		id: 'climate_control_issue',
		name: 'Problema na climatização',
		scope: ['line'],
	},
	{
		category: ['vehicle', 'stop'],
		id: 'validator_issue',
		name: 'Problema no validador',
		scope: ['line', 'stop'],
	},
	{
		category: ['vehicle', 'stop'],
		id: 'accessibility_issue',
		name: 'Problema de acessibilidade',
		scope: ['line', 'stop'],
	},
	{
		category: ['vehicle', 'stop'],
		id: 'lighting_issue',
		name: 'Problema na iluminação',
		scope: ['line', 'stop'],
	},
	{
		category: ['vehicle'],
		id: 'unsafe_speed',
		name: 'Velocidade insegura',
		scope: ['line'],
	},
	{
		category: ['vehicle'],
		id: 'traffic_law_violation',
		name: 'Infração de trânsito',
		scope: ['line'],
	},
	{
		category: ['vehicle', 'stop'],
		id: 'safety_incident',
		name: 'Incidente de segurança',
		scope: ['line', 'stop'],
	},
	{
		agencies: FEEDBACK_SUPPORT_AGENCY_IDS,
		category: ['driver'],
		id: 'lack_of_passenger_support',
		name: 'Falta de apoio ao passageiro',
		scope: ['line'],
	},
	{
		agencies: FEEDBACK_SUPPORT_AGENCY_IDS,
		category: ['driver'],
		id: 'rude_staff',
		name: 'Atendimento rude',
		scope: ['line'],
	},
	{
		agencies: FEEDBACK_SUPPORT_AGENCY_IDS,
		category: ['driver'],
		id: 'driver_bad_conduct',
		name: 'Má conduta do motorista',
		scope: ['line'],
	},
	{
		category: ['driver', 'stop'],
		id: 'disorganized_boarding',
		name: 'Embarque ou fila desorganizada',
		scope: ['line', 'stop'],
	},
	{
		category: ['stop'],
		id: 'no_bench',
		name: 'Sem banco',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'no_shelter',
		name: 'Sem abrigo',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'missing_line_information',
		name: 'Informação de linhas em falta',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'ticket_machine_issue',
		name: 'Problema na máquina de bilhetes',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'elevator_escalator_issue',
		name: 'Problema no elevador ou escada rolante',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'sidewalk_issue',
		name: 'Problema no passeio',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'confusing_signage',
		name: 'Sinalética confusa',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'damaged_bench',
		name: 'Banco danificado',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'shelter_issue',
		name: 'Problema no abrigo',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'no_trash_bin',
		name: 'Sem caixote do lixo',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'weather_exposure_issue',
		name: 'Exposição ao mau tempo',
		scope: ['stop'],
	},
	{
		category: ['driver', 'line_service', 'stop', 'vehicle'],
		id: 'other',
		name: 'Outro',
		scope: ['line', 'stop'],
	},
] as const satisfies readonly FeedbackReasonConfig[];

/* * */

export function getFeedbackReasonGroups(entityType: FeedbackEntityType, agencyId?: string): FeedbackReasonGroups {
	const categories = entityType === 'stop'
		? CATEGORIES.stop
		: agencyId && (FEEDBACK_SUPPORT_AGENCY_IDS as readonly string[]).includes(agencyId)
			? CATEGORIES.line
			: CATEGORIES.line_without_driver;

	const feedbackReasons: readonly FeedbackReasonConfig[] = feedbackConfig;
	const reasonGroups: FeedbackReasonGroups = {};

	for (const category of categories) {
		const options = feedbackReasons
			.filter(reason => reason.scope.includes(entityType))
			.filter(reason => reason.category.includes(category))
			.filter(reason => !reason.agencies || (!!agencyId && reason.agencies.includes(agencyId)))
			.map(reason => ({
				label: reason.name,
				value: reason.id,
			}));

		reasonGroups[category] = {
			heading: CATEGORY_HEADINGS[category],
			options,
		};
	}

	return reasonGroups;
}
