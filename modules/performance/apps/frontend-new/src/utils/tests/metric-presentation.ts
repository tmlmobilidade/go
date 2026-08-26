/* * */

import { createPerformanceFormatters, resolvePerformanceLocale } from '@/hooks/usePerformanceFormatters';
import { calculateMetricDifferencePct, createMetricTrend } from '@/utils/metric-trend';
import assert from 'node:assert/strict';

/* * */

assert.equal(resolvePerformanceLocale('pt'), 'pt-PT');
assert.equal(resolvePerformanceLocale('pt-PT'), 'pt-PT');
assert.equal(resolvePerformanceLocale('es'), 'es-ES');
assert.equal(resolvePerformanceLocale('es-ES'), 'es-ES');

const portuguese = createPerformanceFormatters('pt-PT');
const spanish = createPerformanceFormatters('es-ES');

assert.equal(portuguese.percentage(12.34), '12,3%');
assert.equal(portuguese.signedPercentage(-12.34), '-12,3%');
assert.equal(portuguese.signedPercentagePoints(1.25), '+1,3 p.p.');
assert.equal(portuguese.separators.decimal, ',');
assert.equal(spanish.separators.decimal, ',');
assert.equal(spanish.separators.group, '.');

assert.deepEqual(createMetricTrend(2, { formatValue: portuguese.signedPercentage }), {
	direction: 'up',
	label: '+2,0%',
	sentiment: 'positive',
});
assert.deepEqual(createMetricTrend(2, { formatValue: portuguese.signedPercentage, positiveWhenIncreasing: false }), {
	direction: 'up',
	label: '+2,0%',
	sentiment: 'negative',
});
assert.deepEqual(createMetricTrend(0, { formatValue: portuguese.signedPercentage }), {
	direction: 'flat',
	label: '0,0%',
	sentiment: 'neutral',
});
assert.equal(createMetricTrend(null, { formatValue: portuguese.signedPercentage }), undefined);
assert.equal(calculateMetricDifferencePct(120, 100), 20);
assert.equal(calculateMetricDifferencePct(120, 0), null);
