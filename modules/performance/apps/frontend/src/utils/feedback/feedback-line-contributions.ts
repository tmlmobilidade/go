/* * */

import type { FeedbackEntityMetrics } from '../metrics/feedback-metrics';
import type { PublicFeedback } from '@tmlmobilidade/types';

import { FEEDBACK_TOTAL_PERCENTAGE, getFeedbackReasonLabel, roundFeedbackPercentages } from './feedback-reasons';

/* * */

export type FeedbackLineContributionCategory = 'driver' | 'line_service' | 'unknown' | 'vehicle';

export interface FeedbackLineContributionMeter {
	id: FeedbackLineContributionCategory
	label: string
	reasons: FeedbackLineContributionReasonMeter[]
	selectable: boolean
	value: number
}

export interface FeedbackLineContributionReasonMeter {
	id: string
	label: string
	value: number
}

/* * */

const LINE_CONTRIBUTION_CATEGORIES = [
	{ id: 'line_service', label: 'Linha/Serviço' },
	{ id: 'vehicle', label: 'Veículo' },
	{ id: 'driver', label: 'Condutor' },
	{ id: 'unknown', label: 'Indefinido' },
] as const satisfies readonly { id: FeedbackLineContributionCategory, label: string }[];

const LINE_REASON_CATEGORIES = new Map<string, FeedbackLineContributionCategory[]>([
	['accessibility_issue', ['vehicle']],
	['audio_announcement_issue', ['line_service']],
	['cancelled_departure', ['line_service']],
	['climate_control_issue', ['vehicle']],
	['damaged', ['vehicle']],
	['detour', ['line_service']],
	['did_not_pass', ['line_service']],
	['dirty', ['vehicle']],
	['disorganized_boarding', ['driver']],
	['display_issue', ['line_service']],
	['door_issue', ['vehicle']],
	['driver_bad_conduct', ['driver']],
	['early', ['line_service']],
	['excessive_travel_time', ['line_service']],
	['inaccurate_realtime', ['line_service']],
	['inadequate_service', ['line_service']],
	['insufficient_capacity', ['line_service']],
	['interrupted', ['line_service']],
	['lack_of_passenger_support', ['driver']],
	['late', ['line_service']],
	['lighting_issue', ['vehicle']],
	['long_headway', ['line_service']],
	['long_queue', ['line_service']],
	['missing_safety_equipment', ['vehicle']],
	['other', ['line_service', 'vehicle', 'driver']],
	['route_changed_without_notice', ['line_service']],
	['rude_staff', ['driver']],
	['safety_incident', ['vehicle']],
	['skipped_stop', ['line_service']],
	['too_crowded', ['line_service']],
	['traffic_law_violation', ['driver']],
	['unsafe_speed', ['driver']],
	['validator_issue', ['vehicle']],
	['wrong_panel_information', ['line_service']],
]);

interface LineFeedbackReasonEntry {
	categories: FeedbackLineContributionCategory[]
	id: string
	label: string
}

interface LineFeedbackReasonWeight {
	label: string
	weight: number
}

/* * */

function getLineFeedbackReasonEntries(reasons: string[]): LineFeedbackReasonEntry[] {
	if (reasons.length === 0) {
		return [{
			categories: ['unknown'],
			id: 'no_reason',
			label: getFeedbackReasonLabel('no_reason'),
		}];
	}

	return reasons.map(reason => ({
		categories: LINE_REASON_CATEGORIES.get(reason) ?? ['unknown'],
		id: reason,
		label: getFeedbackReasonLabel(reason),
	}));
}

function createCategoryRecord<T>(createValue: () => T) {
	return Object.fromEntries(
		LINE_CONTRIBUTION_CATEGORIES.map(category => [category.id, createValue()]),
	) as Record<FeedbackLineContributionCategory, T>;
}

function getInitialCategoryWeights() {
	return createCategoryRecord(() => 0);
}

function getInitialReasonWeights() {
	return createCategoryRecord(() => new Map<string, LineFeedbackReasonWeight>());
}

function addReasonWeight(reasonWeights: Map<string, LineFeedbackReasonWeight>, reason: LineFeedbackReasonEntry, weight: number) {
	const currentReasonWeight = reasonWeights.get(reason.id);

	reasonWeights.set(reason.id, {
		label: reason.label,
		weight: (currentReasonWeight?.weight ?? 0) + weight,
	});
}

function getReasonMeters(reasonWeights: Map<string, LineFeedbackReasonWeight>, categoryWeight: number): FeedbackLineContributionReasonMeter[] {
	if (categoryWeight === 0) return [];

	const reasonEntries = Array.from(reasonWeights.entries()).map(([id, reason]) => ({
		id,
		label: reason.label,
		value: (reason.weight / categoryWeight) * FEEDBACK_TOTAL_PERCENTAGE,
	}));

	const roundedValues = roundFeedbackPercentages(reasonEntries.map(reason => reason.value));

	return reasonEntries
		.map((reason, index) => ({
			...reason,
			value: roundedValues[index] ?? reason.value,
		}))
		.sort((reasonA, reasonB) => reasonB.value - reasonA.value || reasonA.label.localeCompare(reasonB.label, 'pt-PT'));
}

/* * */

export function getFeedbackLineContributionMeters(rows: PublicFeedback[], metric: FeedbackEntityMetrics): FeedbackLineContributionMeter[] {
	const categoryWeights = getInitialCategoryWeights();
	const reasonWeights = getInitialReasonWeights();
	let feedbackCount = 0;

	for (const row of rows) {
		if (row.entity_type !== 'line') continue;
		if (row.entity_id !== metric.entityId) continue;

		feedbackCount += 1;

		const reasons = getLineFeedbackReasonEntries(row.reasons);
		const categories = Array.from(new Set(reasons.flatMap(reason => reason.categories)));

		const categoryWeight = 1 / categories.length;
		for (const category of categories) {
			const categoryReasons = reasons.filter(reason => reason.categories.includes(category));
			const reasonWeight = categoryWeight / categoryReasons.length;

			categoryWeights[category] += categoryWeight;
			for (const reason of categoryReasons) addReasonWeight(reasonWeights[category], reason, reasonWeight);
		}
	}

	const contributionMeters = LINE_CONTRIBUTION_CATEGORIES.map(category => ({
		id: category.id,
		label: category.label,
		reasons: getReasonMeters(reasonWeights[category.id], categoryWeights[category.id]),
		selectable: category.id !== 'unknown',
		value: feedbackCount === 0 ? 0 : (categoryWeights[category.id] / feedbackCount) * FEEDBACK_TOTAL_PERCENTAGE,
	}));

	if (feedbackCount === 0) return contributionMeters;

	const roundedValues = roundFeedbackPercentages(contributionMeters.map(meter => meter.value));

	return contributionMeters.map((meter, index) => ({
		...meter,
		value: roundedValues[index] ?? meter.value,
	}));
}
