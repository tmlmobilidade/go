/* * */

export type FeedbackEntityType = 'line' | 'stop';
export type FeedbackReasonCategory = 'driver' | 'line_service' | 'stop' | 'vehicle';
export interface FeedbackReasonConfig {
	category: readonly FeedbackReasonCategory[]
	id: string
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

// use for checkbox limit ajusts :)
export const FEEDBACK_REASON_SELECTION_LIMIT = 1;

const CATEGORY_HEADINGS = {
	driver: 'Motorista/Condutor',
	line_service: 'Linha/Serviço',
	stop: 'Paragem',
	vehicle: 'Veículo',
} as const satisfies Record<FeedbackReasonCategory, string>;

const CATEGORIES = {
	line: ['driver', 'line_service', 'vehicle'],
	stop: ['stop'],
} as const satisfies Record<FeedbackEntityType, readonly FeedbackReasonCategory[]>;

/* * */

export const feedbackConfig = [
	{
		category: ['line_service'],
		id: 'early',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'late',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'detour',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'long_headway',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'too_crowded',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'insufficient_capacity',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'cancelled_departure',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'long_queue',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'interrupted',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'inaccurate_realtime',
		scope: ['line'],
	},
	{
		category: ['line_service', 'stop'],
		id: 'wrong_panel_information',
		scope: ['line', 'stop'],
	},
	{
		category: ['line_service', 'stop'],
		id: 'display_issue',
		scope: ['line', 'stop'],
	},
	{
		category: ['line_service', 'stop'],
		id: 'audio_announcement_issue',
		scope: ['line', 'stop'],
	},
	{
		category: ['line_service'],
		id: 'did_not_pass',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'route_changed_without_notice',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'skipped_stop',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'inadequate_service',
		scope: ['line'],
	},
	{
		category: ['line_service'],
		id: 'excessive_travel_time',
		scope: ['line'],
	},
	{
		category: ['vehicle'],
		id: 'damaged',
		scope: ['line'],
	},
	{
		category: ['vehicle', 'stop'],
		id: 'dirty',
		scope: ['line', 'stop'],
	},
	{
		category: ['vehicle'],
		id: 'missing_safety_equipment',
		scope: ['line'],
	},
	{
		category: ['vehicle'],
		id: 'door_issue',
		scope: ['line'],
	},
	{
		category: ['vehicle'],
		id: 'climate_control_issue',
		scope: ['line'],
	},
	{
		category: ['vehicle', 'stop'],
		id: 'validator_issue',
		scope: ['line', 'stop'],
	},
	{
		category: ['vehicle', 'stop'],
		id: 'accessibility_issue',
		scope: ['line', 'stop'],
	},
	{
		category: ['vehicle', 'stop'],
		id: 'lighting_issue',
		scope: ['line', 'stop'],
	},
	{
		category: ['vehicle'],
		id: 'unsafe_speed',
		scope: ['line'],
	},
	{
		category: ['vehicle'],
		id: 'traffic_law_violation',
		scope: ['line'],
	},
	{
		category: ['vehicle', 'stop'],
		id: 'safety_incident',
		scope: ['line', 'stop'],
	},
	{
		category: ['driver'],
		id: 'lack_of_passenger_support',
		scope: ['line'],
	},
	{
		category: ['driver'],
		id: 'rude_staff',
		scope: ['line'],
	},
	{
		category: ['driver'],
		id: 'driver_bad_conduct',
		scope: ['line'],
	},
	{
		category: ['driver', 'stop'],
		id: 'disorganized_boarding',
		scope: ['line', 'stop'],
	},
	{
		category: ['stop'],
		id: 'no_bench',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'no_shelter',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'missing_line_information',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'ticket_machine_issue',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'elevator_escalator_issue',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'sidewalk_issue',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'confusing_signage',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'damaged_bench',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'shelter_issue',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'no_trash_bin',
		scope: ['stop'],
	},
	{
		category: ['stop'],
		id: 'weather_exposure_issue',
		scope: ['stop'],
	},
	{
		category: ['driver', 'line_service', 'stop', 'vehicle'],
		id: 'other',
		scope: ['line', 'stop'],
	},
] as const satisfies readonly FeedbackReasonConfig[];

/* * */

type FeedbackReasonId = typeof feedbackConfig[number]['id'];

export function getFeedbackReasonCategories(entityType: FeedbackEntityType) {
	return CATEGORIES[entityType];
}

export function getFeedbackReasonGroups(entityType: FeedbackEntityType, translateReason: (reasonId: FeedbackReasonId) => string): FeedbackReasonGroups {
	const categories = CATEGORIES[entityType];
	const feedbackReasons = feedbackConfig;
	const reasonGroups: FeedbackReasonGroups = {};

	for (const category of categories) {
		const options = feedbackReasons
			.filter(reason => reason.scope.some(scope => scope === entityType))
			.filter(reason => reason.category.some(reasonCategory => reasonCategory === category))
			.map(reason => ({
				label: translateReason(reason.id),
				value: reason.id,
			}));

		reasonGroups[category] = {
			heading: CATEGORY_HEADINGS[category],
			options,
		};
	}

	return reasonGroups;
}
