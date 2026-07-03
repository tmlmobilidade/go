/* * */

import type { PublicFeedbackEntityType } from '@/feedback/entity-type.js';

/* * */

export type PublicFeedbackReasonCategory = 'driver' | 'line_service' | 'stop' | 'vehicle';

export interface PublicFeedbackReasonConfig {
	category: readonly PublicFeedbackReasonCategory[]
	id: string
	scope: readonly PublicFeedbackEntityType[]
}

/* * */

export const PUBLIC_FEEDBACK_NO_REASON_ID = 'no_reason';

export const PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT = 1;

export const PUBLIC_FEEDBACK_REASON_CATEGORIES_BY_ENTITY = {
	line: ['driver', 'line_service', 'vehicle'],
	stop: ['stop'],
} as const satisfies Record<PublicFeedbackEntityType, readonly PublicFeedbackReasonCategory[]>;

export const PUBLIC_FEEDBACK_REASON_CONFIGS = [
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
		category: ['driver'],
		id: 'unsafe_speed',
		scope: ['line'],
	},
	{
		category: ['driver'],
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
] as const satisfies readonly PublicFeedbackReasonConfig[];

/* * */

export type PublicFeedbackReasonId = typeof PUBLIC_FEEDBACK_REASON_CONFIGS[number]['id'];

const PUBLIC_FEEDBACK_REASON_CONFIG_BY_ID = new Map<string, PublicFeedbackReasonConfig>();

for (const reason of PUBLIC_FEEDBACK_REASON_CONFIGS) {
	PUBLIC_FEEDBACK_REASON_CONFIG_BY_ID.set(reason.id, reason);
}

export function getPublicFeedbackReasonConfig(reasonId: string) {
	return PUBLIC_FEEDBACK_REASON_CONFIG_BY_ID.get(reasonId);
}

export function getPublicFeedbackReasonConfigsByEntity(entityType: PublicFeedbackEntityType) {
	return PUBLIC_FEEDBACK_REASON_CONFIGS.filter(reason => (reason.scope as readonly PublicFeedbackEntityType[]).includes(entityType));
}

export function getPublicFeedbackReasonValuesByEntity(entityType: PublicFeedbackEntityType) {
	return getPublicFeedbackReasonConfigsByEntity(entityType).map(reason => reason.id);
}
