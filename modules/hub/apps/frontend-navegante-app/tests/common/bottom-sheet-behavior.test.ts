import { getBottomSheetSnapState, getMapInteractionCollapseTarget } from '@/utils/bottom-sheet/behavior';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('map-aware bottom-sheet collapse behavior', () => {
	it('collapses an expanded sheet to its compact snap for a user map gesture', () => {
		assert.equal(getMapInteractionCollapseTarget({
			compactSnapIndex: 1,
			hasOriginalEvent: true,
			snapIndex: 3,
		}), 1);
		assert.equal(getMapInteractionCollapseTarget({
			compactSnapIndex: 1,
			hasOriginalEvent: false,
			snapIndex: 3,
		}), null);
	});
});

describe('bottom-sheet snap publication', () => {
	it('publishes the snap point represented by the selected index', () => {
		assert.deepEqual(getBottomSheetSnapState([0, 0.28, 0.64, 0.95], 2), {
			snapIndex: 2,
			snapPoint: 0.64,
		});
	});
});
