/* * */

import { getPublicFeedbackReasonCategoriesByEntity, getPublicFeedbackV2ReasonValuesByCategory, type PublicFeedbackEntityType, type PublicFeedbackReasonCategory, type PublicFeedbackV2Reason } from '@tmlmobilidade/go-types-hub';

/* * */

export type FeedbackEntityType = PublicFeedbackEntityType;
export type FeedbackReasonCategory = PublicFeedbackReasonCategory;

export interface FeedbackReasonGroup {
	heading: string
	options: FeedbackReasonOption[]
}

export interface FeedbackReasonOption {
	label: string
	value: PublicFeedbackV2Reason
}

export type FeedbackReasonGroups = Partial<Record<FeedbackReasonCategory, FeedbackReasonGroup>>;

/* * */

export function getFeedbackReasonCategories(entityType: FeedbackEntityType) {
	return getPublicFeedbackReasonCategoriesByEntity(entityType);
}

export function getFeedbackReasonGroups(
	entityType: FeedbackEntityType,
	translateCategory: (category: FeedbackReasonCategory) => string,
	translateReason: (reason: PublicFeedbackV2Reason) => string,
): FeedbackReasonGroups {
	const categories = getFeedbackReasonCategories(entityType);
	const reasonGroups: FeedbackReasonGroups = {};

	for (const category of categories) {
		const options = getPublicFeedbackV2ReasonValuesByCategory(category)
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
