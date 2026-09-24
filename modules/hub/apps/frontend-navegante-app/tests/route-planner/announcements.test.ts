import { getRoutePlannerResultsStatus } from '@/utils/route-planner/planning/announcements';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

const settledResults = {
	hasEndpoints: true,
	isPlanning: false,
	planError: null,
	previousSelectedIndex: 0,
	previousVisibleCount: 2,
	selectedIndex: 0,
	selectedSummary: '14:10 até 14:42, 32 min, Autocarro 728, 1 troca, 8 min a pé',
	selectionCameFromUser: false,
	visibleCount: 2,
};

describe('route planner result announcements', () => {
	it('announces planning before any result count', () => {
		assert.deepEqual(getRoutePlannerResultsStatus({
			...settledResults,
			isPlanning: true,
			previousVisibleCount: null,
			visibleCount: 0,
		}), { type: 'planning' });
	});

	it('leaves failures to the alert and ignores incomplete searches', () => {
		assert.deepEqual(getRoutePlannerResultsStatus({
			...settledResults,
			planError: 'Não foi possível calcular a rota.',
		}), { type: 'idle' });
		assert.deepEqual(getRoutePlannerResultsStatus({
			...settledResults,
			hasEndpoints: false,
		}), { type: 'idle' });
	});

	it('announces an empty filtered result set and a changed result count', () => {
		assert.deepEqual(getRoutePlannerResultsStatus({
			...settledResults,
			visibleCount: 0,
		}), { type: 'no_results' });
		assert.deepEqual(getRoutePlannerResultsStatus({
			...settledResults,
			previousVisibleCount: null,
			selectedIndex: 1,
			visibleCount: 3,
		}), { count: 3, type: 'result_count' });
	});

	it('announces a programmatic selection and stays quiet when the user selects a card', () => {
		assert.deepEqual(getRoutePlannerResultsStatus({
			...settledResults,
			previousSelectedIndex: 0,
			selectedIndex: 1,
		}), { summary: settledResults.selectedSummary, type: 'selected' });
		assert.deepEqual(getRoutePlannerResultsStatus({
			...settledResults,
			previousSelectedIndex: 0,
			selectedIndex: 1,
			selectionCameFromUser: true,
		}), { type: 'idle' });
	});
});
