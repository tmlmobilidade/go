import { MAP_BOTTOM_SHEET_SNAP_POINTS } from '@/constants/bottom-sheet';
import { getBottomSheetSnapState, getInsetAdjustedSnapPoints, getMapInteractionCollapseTarget, shouldShowBottomSheetOverlay } from '@/utils/bottom-sheet/behavior';
import { reduceBottomSheetNavigation } from '@/utils/bottom-sheet/navigation';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('bottom-sheet safe-area clearance', () => {
	it('preserves the usable partial-sheet height above the native navbar', () => {
		for (const sheetHeight of [400, 800]) {
			const adjusted = getInsetAdjustedSnapPoints(MAP_BOTTOM_SHEET_SNAP_POINTS, 88, sheetHeight);
			for (const index of [1, 2]) {
				assert.ok(Math.abs(adjusted[index] * sheetHeight - 88 - MAP_BOTTOM_SHEET_SNAP_POINTS[index] * sheetHeight) < 0.001);
			}
			assert.equal(adjusted[0], 0);
			assert.equal(adjusted.at(-1), 1);
		}
	});

	it('keeps existing snap points when no bottom inset is present or the sheet is not measured', () => {
		assert.deepEqual(getInsetAdjustedSnapPoints(MAP_BOTTOM_SHEET_SNAP_POINTS, 0, 800), MAP_BOTTOM_SHEET_SNAP_POINTS);
		assert.deepEqual(getInsetAdjustedSnapPoints(MAP_BOTTOM_SHEET_SNAP_POINTS, 88, 0), MAP_BOTTOM_SHEET_SNAP_POINTS);
		assert.deepEqual(getInsetAdjustedSnapPoints([0, 1], 88, 800), [0, 1]);
	});

	it('keeps partial snaps distinct and below full height when space is limited', () => {
		const adjusted = getInsetAdjustedSnapPoints(MAP_BOTTOM_SHEET_SNAP_POINTS, 180, 200);
		assert.ok(adjusted[1] < adjusted[2]);
		assert.ok(adjusted[2] < 1);
		assert.equal(adjusted.at(-1), 1);
	});
});

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
	it('keeps the terminal snap required by react-modal-sheet', () => {
		assert.equal(MAP_BOTTOM_SHEET_SNAP_POINTS.at(-1), 1);
	});

	it('publishes the snap point represented by the selected index', () => {
		assert.deepEqual(getBottomSheetSnapState(MAP_BOTTOM_SHEET_SNAP_POINTS, 2), {
			snapIndex: 2,
			snapPoint: 0.64,
		});
	});
});

describe('bottom-sheet overlay behavior', () => {
	it('shows an overlay at the terminal snap even when the sheet disables its persistent overlay', () => {
		assert.equal(shouldShowBottomSheetOverlay({
			snapIndex: MAP_BOTTOM_SHEET_SNAP_POINTS.length - 1,
			snapPoints: MAP_BOTTOM_SHEET_SNAP_POINTS,
			withOverlay: false,
		}), true);
	});

	it('keeps a non-modal partial sheet clear and preserves explicitly requested overlays', () => {
		assert.equal(shouldShowBottomSheetOverlay({
			snapIndex: 1,
			snapPoints: MAP_BOTTOM_SHEET_SNAP_POINTS,
			withOverlay: false,
		}), false);
		assert.equal(shouldShowBottomSheetOverlay({
			snapIndex: 1,
			snapPoints: MAP_BOTTOM_SHEET_SNAP_POINTS,
			withOverlay: true,
		}), true);
	});
});

describe('bottom-sheet navigation operations', () => {
	const search = { entityId: null, view: 'search' as const };
	const stop = { entityId: 'stop-1', view: 'stops-detail' as const };
	const routes = { entityId: null, view: 'routes' as const };

	it('pushes a sheet while preserving the previous entry', () => {
		assert.deepEqual(reduceBottomSheetNavigation([search], { entry: stop, type: 'push' }), [search, stop]);
	});

	it('returns from map detail to route results when the detail is closed', () => {
		const stack = reduceBottomSheetNavigation([search, routes], { entry: stop, type: 'push' });
		assert.deepEqual(reduceBottomSheetNavigation(stack, { type: 'pop' }), [search, routes]);
	});

	it('does not add another history entry when reopening the same sheet', () => {
		const stack = [search, stop];
		assert.equal(reduceBottomSheetNavigation(stack, { entry: stop, type: 'push' }), stack);
	});

	it('replaces the active detail when another entity of the same type opens', () => {
		const nextStop = { entityId: 'stop-2', view: 'stops-detail' as const };
		const firstVehicle = { entityId: 'vehicle-1', view: 'vehicles-detail' as const };
		const nextVehicle = { entityId: 'vehicle-2', view: 'vehicles-detail' as const };
		assert.deepEqual(reduceBottomSheetNavigation([search, stop], { entry: nextStop, type: 'push' }), [search, nextStop]);
		assert.deepEqual(reduceBottomSheetNavigation([search, firstVehicle], { entry: nextVehicle, type: 'push' }), [search, nextVehicle]);
	});

	it('restores pre-trip results and their previous sheet after trip sheets were cleared', () => {
		const beforeTrip = [search, routes];
		const duringTrip = reduceBottomSheetNavigation(beforeTrip, { type: 'clear' });
		const restored = reduceBottomSheetNavigation(duringTrip, { entries: beforeTrip, type: 'restore' });
		assert.deepEqual(restored, beforeTrip);
		assert.deepEqual(reduceBottomSheetNavigation(restored, { type: 'pop' }), [search]);
		assert.deepEqual(beforeTrip, [search, routes]);
	});

	it('replaces only the active sheet', () => {
		assert.deepEqual(reduceBottomSheetNavigation([search, stop], { entry: routes, type: 'replace-active' }), [search, routes]);
		assert.deepEqual(reduceBottomSheetNavigation([], { entry: routes, type: 'replace-active' }), [routes]);
	});

	it('pops the active sheet and can clear the full stack', () => {
		assert.deepEqual(reduceBottomSheetNavigation([search, stop], { type: 'pop' }), [search]);
		assert.deepEqual(reduceBottomSheetNavigation([search, stop], { type: 'clear' }), []);
	});
});
