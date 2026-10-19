import { type PublicFeedbackEntityType } from '@tmlmobilidade/go-types-hub';

/* * */

export const FEEDBACK_COOLDOWN_DURATION_MS = 24 * 60 * 60 * 1000;

/* * */

export function getFeedbackCooldownEndsAt(now = Date.now()) {
	return now + FEEDBACK_COOLDOWN_DURATION_MS;
}

export function getFeedbackCooldownKey(entityType: PublicFeedbackEntityType, entityId: string) {
	return `feedback-cooldown:${entityType}:${entityId}`;
}

export function isFeedbackCooldownActive(storedEndsAt: null | string, now = Date.now()) {
	const endsAt = Number(storedEndsAt);
	return Number.isFinite(endsAt) && endsAt > now;
}
