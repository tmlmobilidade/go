import { getFeedbackBackTarget, getFeedbackReasonSelectionTarget, hasFeedbackTarget, shouldShowFeedbackTrigger } from '@/utils/feedback/navigation';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/* * */

describe('feedback sheet navigation', () => {
	it('allows stops without an agency and requires one for lines', () => {
		assert.equal(hasFeedbackTarget('stop', 'stop-id', undefined), true);
		assert.equal(hasFeedbackTarget('line', 'line-id', 'agency-id'), true);
		assert.equal(hasFeedbackTarget('line', 'line-id', undefined), false);
		assert.equal(hasFeedbackTarget('stop', undefined, undefined), false);
	});

	it('uses one forward flow for lines and skips categories for stops', () => {
		assert.equal(getFeedbackReasonSelectionTarget(3), 'categories');
		assert.equal(getFeedbackReasonSelectionTarget(1), 'reasons');
	});

	it('returns to the previous step without stacking another sheet', () => {
		assert.equal(getFeedbackBackTarget('reasons', 3), 'categories');
		assert.equal(getFeedbackBackTarget('reasons', 1), 'mood');
		assert.equal(getFeedbackBackTarget('categories', 3), 'mood');
		assert.equal(getFeedbackBackTarget('mood', 3), null);
	});

	it('shows the trigger from half-sheet upwards only while the flow is closed', () => {
		assert.equal(shouldShowFeedbackTrigger(0.28, false, false), false);
		assert.equal(shouldShowFeedbackTrigger(0.64, false, false), true);
		assert.equal(shouldShowFeedbackTrigger(0.95, false, false), true);
		assert.equal(shouldShowFeedbackTrigger(0.64, true, false), false);
		assert.equal(shouldShowFeedbackTrigger(0.64, false, true), false);
	});
});
