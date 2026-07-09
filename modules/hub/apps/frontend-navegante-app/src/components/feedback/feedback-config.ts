/* * */

import {
	PUBLIC_FEEDBACK_REASON_CATEGORIES_BY_ENTITY,
	PUBLIC_FEEDBACK_REASON_CONFIGS,
	PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT,
	type PublicFeedbackEntityType,
	type PublicFeedbackReasonCategory,
	type PublicFeedbackReasonConfig,
	type PublicFeedbackReasonId,
} from '@tmlmobilidade/go-types-performance';

/* * */

export type FeedbackEntityType = PublicFeedbackEntityType;
export type FeedbackReasonCategory = PublicFeedbackReasonCategory;
export type FeedbackReasonConfig = PublicFeedbackReasonConfig;
export type FeedbackReasonId = PublicFeedbackReasonId;

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
export const FEEDBACK_REASON_SELECTION_LIMIT = PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT;
export const feedbackConfig = PUBLIC_FEEDBACK_REASON_CONFIGS;

/* * */

export function getFeedbackReasonCategories(entityType: FeedbackEntityType) {
	return PUBLIC_FEEDBACK_REASON_CATEGORIES_BY_ENTITY[entityType];
}

export function getFeedbackReasonGroups(
	entityType: FeedbackEntityType,
	translateReason: (reasonId: FeedbackReasonId) => string,
	translateCategory: (category: FeedbackReasonCategory) => string,
): FeedbackReasonGroups {
	const categories = PUBLIC_FEEDBACK_REASON_CATEGORIES_BY_ENTITY[entityType];
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
			heading: translateCategory(category),
			options,
		};
	}

	return reasonGroups;
}
