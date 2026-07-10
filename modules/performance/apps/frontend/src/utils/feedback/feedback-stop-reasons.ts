/* * */

import type { FeedbackEntityMetrics } from '../metrics/feedback-metrics';
import type { PublicFeedback } from '@tmlmobilidade/go-types-performance';

import { FEEDBACK_TOTAL_PERCENTAGE, type FeedbackReasonCategoryTranslator, type FeedbackReasonTranslator, roundFeedbackPercentages } from './feedback-reasons';

/* * */

export type FeedbackStopReasonCategory = 'stop' | 'unknown';

export interface FeedbackStopReasonMeter {
	id: FeedbackStopReasonCategory
	label: string
	reasons: FeedbackStopReasonReasonMeter[]
	selectable: boolean
	value: number
}

export interface FeedbackStopReasonReasonMeter {
	id: string
	label: string
	value: number
}

interface StopFeedbackReasonCount {
	label: string
	value: number
}

/* * */

const STOP_REASON_CATEGORY_IDS = ['stop', 'unknown'] as const satisfies readonly FeedbackStopReasonCategory[];

function getReasonMeters(reasonCounts: Map<string, StopFeedbackReasonCount>, totalReasonCount: number): FeedbackStopReasonReasonMeter[] {
	if (totalReasonCount === 0) return [];

	const reasonEntries = Array.from(reasonCounts.entries())
		.map(([id, reason]) => ({
			id,
			label: reason.label,
			value: (reason.value / totalReasonCount) * FEEDBACK_TOTAL_PERCENTAGE,
		}))
		.sort((reasonA, reasonB) => reasonB.value - reasonA.value || reasonA.label.localeCompare(reasonB.label, 'pt-PT'));

	const roundedValues = roundFeedbackPercentages(reasonEntries.map(reason => reason.value));

	return reasonEntries.map((reason, index) => ({
		...reason,
		value: roundedValues[index],
	}));
}

/* * */

export function getFeedbackStopReasonMeters(rows: PublicFeedback[], metric: FeedbackEntityMetrics, translateReason: FeedbackReasonTranslator, translateReasonCategory: FeedbackReasonCategoryTranslator): FeedbackStopReasonMeter[] {
	const reasonCounts = new Map<string, StopFeedbackReasonCount>();
	let feedbackCount = 0;
	let reasonedFeedbackCount = 0;
	let totalReasonCount = 0;
	let unknownFeedbackCount = 0;

	for (const row of rows) {
		if (row.entity_type !== 'stop') continue;
		if (row.entity_id !== metric.entityId) continue;

		feedbackCount += 1;

		if (row.reasons.length === 0) {
			unknownFeedbackCount += 1;
			continue;
		}

		reasonedFeedbackCount += 1;

		for (const reason of Array.from(new Set(row.reasons))) {
			const currentReasonCount = reasonCounts.get(reason);

			reasonCounts.set(reason, {
				label: currentReasonCount?.label ?? translateReason(reason),
				value: (currentReasonCount?.value ?? 0) + 1,
			});

			totalReasonCount += 1;
		}
	}

	const categoryValues = [
		feedbackCount === 0 ? 0 : (reasonedFeedbackCount / feedbackCount) * FEEDBACK_TOTAL_PERCENTAGE,
		feedbackCount === 0 ? 0 : (unknownFeedbackCount / feedbackCount) * FEEDBACK_TOTAL_PERCENTAGE,
	];

	const roundedCategoryValues = feedbackCount === 0 ? categoryValues : roundFeedbackPercentages(categoryValues);
	const reasonMeters = getReasonMeters(reasonCounts, totalReasonCount);

	return STOP_REASON_CATEGORY_IDS.map((category, index) => ({
		id: category,
		label: translateReasonCategory(category),
		reasons: category === 'stop' ? reasonMeters : [],
		selectable: category === 'stop' && reasonMeters.length > 0,
		value: roundedCategoryValues[index],
	}));
}
