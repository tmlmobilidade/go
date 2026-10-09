import { FEEDBACK_COOLDOWN_DURATION_MS, getFeedbackCooldownEndsAt, getFeedbackCooldownKey, isFeedbackCooldownActive } from '@/utils/feedback/cooldown';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/* * */

describe('feedback cooldown', () => {
	it('isolates cooldowns by entity type and ID', () => {
		assert.equal(getFeedbackCooldownKey('line', '[BNA17]2792'), 'feedback-cooldown:line:[BNA17]2792');
		assert.equal(getFeedbackCooldownKey('stop', '060001'), 'feedback-cooldown:stop:060001');
	});

	it('remains active for 24 hours after a successful submission', () => {
		const now = 1_700_000_000_000;
		const endsAt = getFeedbackCooldownEndsAt(now);

		assert.equal(endsAt, now + FEEDBACK_COOLDOWN_DURATION_MS);
		assert.equal(isFeedbackCooldownActive(String(endsAt), now), true);
		assert.equal(isFeedbackCooldownActive(String(endsAt), endsAt), false);
		assert.equal(isFeedbackCooldownActive('invalid', now), false);
	});
});
