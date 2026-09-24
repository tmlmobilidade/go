/* * */

import { z } from 'zod';

import { type PublicFeedbackEntityType } from './entity-type.js';

/* * */

export const PublicFeedbackReasonCategoryValues = [
	'driver',
	'line_service',
	'stop',
	'vehicle',
] as const;

export const PublicFeedbackReasonCategorySchema = z.enum(PublicFeedbackReasonCategoryValues);

export type PublicFeedbackReasonCategory = z.infer<typeof PublicFeedbackReasonCategorySchema>;

/* * */

export const PublicFeedbackReasonCategoriesByEntity = {
	line: ['driver', 'line_service', 'vehicle'],
	stop: ['stop'],
} as const satisfies Record<PublicFeedbackEntityType, readonly PublicFeedbackReasonCategory[]>;

export const PublicFeedbackReasonValuesByCategory = {
	driver: [
		'lack_of_passenger_support',
		'rude_staff',
		'driver_bad_conduct',
		'disorganized_boarding',
		'other',
	],
	line_service: [
		'early',
		'late',
		'detour',
		'long_headway',
		'too_crowded',
		'insufficient_capacity',
		'cancelled_departure',
		'long_queue',
		'interrupted',
		'inaccurate_realtime',
		'wrong_panel_information',
		'display_issue',
		'audio_announcement_issue',
		'did_not_pass',
		'route_changed_without_notice',
		'skipped_stop',
		'inadequate_service',
		'excessive_travel_time',
		'other',
	],
	stop: [
		'wrong_panel_information',
		'display_issue',
		'audio_announcement_issue',
		'dirty',
		'validator_issue',
		'accessibility_issue',
		'lighting_issue',
		'safety_incident',
		'disorganized_boarding',
		'no_bench',
		'no_shelter',
		'missing_line_information',
		'ticket_machine_issue',
		'elevator_escalator_issue',
		'sidewalk_issue',
		'confusing_signage',
		'damaged_bench',
		'shelter_issue',
		'no_trash_bin',
		'weather_exposure_issue',
		'other',
	],
	vehicle: [
		'damaged',
		'dirty',
		'missing_safety_equipment',
		'door_issue',
		'climate_control_issue',
		'validator_issue',
		'accessibility_issue',
		'lighting_issue',
		'unsafe_speed',
		'traffic_law_violation',
		'safety_incident',
		'other',
	],
} as const satisfies Record<PublicFeedbackReasonCategory, readonly string[]>;

export type PublicFeedbackReason = typeof PublicFeedbackReasonValuesByCategory[PublicFeedbackReasonCategory][number];

/* * */

export const PublicFeedbackReasonValues = [
	...new Set<PublicFeedbackReason>(Object.values(PublicFeedbackReasonValuesByCategory).flat()),
] as [PublicFeedbackReason, ...PublicFeedbackReason[]];

export const PublicFeedbackReasonSchema = z.enum(PublicFeedbackReasonValues);

/* * */

export function getPublicFeedbackReasonCategoriesByEntity(entityType: PublicFeedbackEntityType) {
	return PublicFeedbackReasonCategoriesByEntity[entityType];
}

export function getPublicFeedbackReasonValuesByCategory(category: PublicFeedbackReasonCategory) {
	return PublicFeedbackReasonValuesByCategory[category];
}

export function getPublicFeedbackReasonValuesByEntity(entityType: PublicFeedbackEntityType): PublicFeedbackReason[] {
	const categories = getPublicFeedbackReasonCategoriesByEntity(entityType);
	return [...new Set(categories.flatMap(category => getPublicFeedbackReasonValuesByCategory(category)))];
}
