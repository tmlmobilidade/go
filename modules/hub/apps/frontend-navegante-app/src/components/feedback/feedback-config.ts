/* * */

import { getPublicFeedbackReasonCategoriesByEntity, getPublicFeedbackReasonValuesByCategory, type PublicFeedbackEntityType, type PublicFeedbackReason, type PublicFeedbackReasonCategory } from '@tmlmobilidade/go-types-hub';

/* * */

export type FeedbackEntityType = PublicFeedbackEntityType;
export type FeedbackReasonCategory = PublicFeedbackReasonCategory;

export interface FeedbackReasonGroup {
	heading: string
	options: FeedbackReasonOption[]
}

export interface FeedbackReasonOption {
	label: string
	value: PublicFeedbackReason
}

export type FeedbackReasonGroups = Partial<Record<FeedbackReasonCategory, FeedbackReasonGroup>>;

/* * */

export function getFeedbackReasonCategories(entityType: FeedbackEntityType) {
	return getPublicFeedbackReasonCategoriesByEntity(entityType);
}

export function getFeedbackReasonGroups(
	entityType: FeedbackEntityType,
	translateCategory: (category: FeedbackReasonCategory) => string,
	translateReason: (reason: PublicFeedbackReason) => string,
): FeedbackReasonGroups {
	const categories = getFeedbackReasonCategories(entityType);
	const reasonGroups: FeedbackReasonGroups = {};

	for (const category of categories) {
		const options = getPublicFeedbackReasonValuesByCategory(category)
			.map(reason => ({
				label: translateReason(reason),
				value: reason,
			}));

		reasonGroups[category] = {
			heading: translateCategory(category),
			options,
		};
	}

	return reasonGroups;
}
