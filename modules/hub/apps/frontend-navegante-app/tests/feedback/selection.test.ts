import { toggleFeedbackReason } from '@/utils/feedback/selection';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/* * */

describe('feedback reason selection', () => {
	it('allows multiple reasons to be selected independently', () => {
		const firstSelection = toggleFeedbackReason([], 'late');
		const secondSelection = toggleFeedbackReason(firstSelection, 'too_crowded');

		assert.deepEqual(secondSelection, ['late', 'too_crowded']);
	});

	it('removes only the reason that is toggled off', () => {
		const selection = toggleFeedbackReason(['late', 'too_crowded'], 'late');

		assert.deepEqual(selection, ['too_crowded']);
	});

	it('does not exceed the public feedback reason limit', () => {
		const selection = toggleFeedbackReason(['early', 'late', 'detour', 'long_headway'], 'too_crowded');

		assert.deepEqual(selection, ['early', 'late', 'detour', 'long_headway']);
	});
});
