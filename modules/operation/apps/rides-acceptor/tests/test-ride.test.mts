import { RideAcceptanceSchema } from '@tmlmobilidade/go-types-operation';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { testRide } from '../src/test-ride.js';
import { type RideWithAnalyses } from '../src/types/ride-with-analyses.js';

const analysis = 'simple_three_vehicle_events';
const ride: RideWithAnalyses = {
	_id: 'ride',
	analysis: {},
	operational_status: 'ended',
	route_short_name: '3506',
};

test('stores missing or unsupported grades as failures and uses normalized grades for acceptance', () => {
	const cases = [
		{ grade: null, storedGrade: 'fail' },
		{ grade: '', storedGrade: 'fail' },
		{ grade: 'unexpected', storedGrade: 'fail' },
		{ grade: 'PASS', storedGrade: 'pass' },
		{ grade: 'skip', storedGrade: 'skip' },
		{ grade: 'error', storedGrade: 'error' },
	];

	for (const { grade, storedGrade } of cases) {
		const result = testRide({ ...ride, analysis: { [analysis]: { grade, reason: null } } });
		assert.equal(result.analysisSummary[analysis]?.grade, storedGrade, String(grade));
		assert.equal(result.pass, storedGrade === 'pass', String(grade));
		RideAcceptanceSchema.shape.analysis_summary.parse(result.analysisSummary);
	}

	const missing = testRide(ride);
	assert.deepEqual(missing.analysisSummary[analysis], { grade: 'fail', reason: `Required analysis missing: ${analysis}` });
	assert.equal(missing.pass, false);
});
