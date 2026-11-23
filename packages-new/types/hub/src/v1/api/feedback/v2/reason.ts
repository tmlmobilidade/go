/* * */

import { z } from 'zod';

import { type PublicFeedbackEntityType } from '../v1/entity-type.js';
import { getPublicFeedbackReasonCategoriesByEntity, type PublicFeedbackReasonCategory } from '../v1/reason.js';

/* * */

export const PublicFeedbackV2ReasonValuesByCategory = {
	driver: [
		'lack_of_passenger_support',
		'rude_staff',
		'driver_bad_conduct',
		'disorganized_boarding',
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
	],
} as const satisfies Record<PublicFeedbackReasonCategory, readonly string[]>;

export type PublicFeedbackV2Reason = typeof PublicFeedbackV2ReasonValuesByCategory[PublicFeedbackReasonCategory][number];

/* * */

export const PublicFeedbackV2ReasonValues = [
	...new Set<PublicFeedbackV2Reason>(Object.values(PublicFeedbackV2ReasonValuesByCategory).flat()),
] as [PublicFeedbackV2Reason, ...PublicFeedbackV2Reason[]];

export const PublicFeedbackV2ReasonSchema = z.enum(PublicFeedbackV2ReasonValues);

/* * */

export function getPublicFeedbackV2ReasonValuesByCategory(category: PublicFeedbackReasonCategory) {
	return PublicFeedbackV2ReasonValuesByCategory[category];
}

export function getPublicFeedbackV2ReasonValuesByEntity(entityType: PublicFeedbackEntityType): PublicFeedbackV2Reason[] {
	const categories = getPublicFeedbackReasonCategoriesByEntity(entityType);
	return [...new Set(categories.flatMap(category => getPublicFeedbackV2ReasonValuesByCategory(category)))];
}
