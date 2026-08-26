/* * */

import { aggregateMetricEvolutionPoints } from '@/components/common/MetricEvolutionChart/metrics';
import assert from 'node:assert/strict';

/* * */

const points = Array.from({ length: 8 }, (_, index) => ({
	period: 20260701 + index,
	value: index + 1,
}));

assert.deepEqual(aggregateMetricEvolutionPoints(points, false), points);
assert.deepEqual(aggregateMetricEvolutionPoints(points, true), [
	{ period: 20260701, periodEnd: 20260707, value: 28 },
	{ period: 20260708, periodEnd: 20260708, value: 8 },
]);
