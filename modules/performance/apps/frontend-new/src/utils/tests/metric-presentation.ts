/* * */

import { calculateMetricDifferencePct, getMetricTrendDirection, getMetricTrendSentiment } from '@/utils/metric-trend';
import { createPerformanceFormatters, formatPerformanceValue, resolvePerformanceLocale } from '@/utils/performance-formatters';
import assert from 'node:assert/strict';

/* * */

assert.equal(resolvePerformanceLocale('pt'), 'pt-PT');
assert.equal(resolvePerformanceLocale('pt-PT'), 'pt-PT');
assert.equal(resolvePerformanceLocale('es'), 'es-ES');
assert.equal(resolvePerformanceLocale('es-ES'), 'es-ES');

const portuguese = createPerformanceFormatters('pt-PT');
const spanish = createPerformanceFormatters('es-ES');

assert.equal(portuguese.percentage(12.34), '12,3%');
assert.equal(formatPerformanceValue(-12.34, 'percentage', portuguese, { signed: true }), '-12,3%');
assert.equal(formatPerformanceValue(1.25, 'percentage-points', portuguese, { signed: true }), '+1,3 p.p.');
assert.equal(formatPerformanceValue(90, 'duration-minutes', portuguese), '1h30');
assert.equal(formatPerformanceValue(480, 'clock-minutes', portuguese), '08:00');
assert.equal(portuguese.separators.decimal, ',');
assert.equal(spanish.separators.decimal, ',');
assert.equal(spanish.separators.group, '.');

assert.equal(getMetricTrendDirection(2), 'up');
assert.equal(getMetricTrendDirection(-2), 'down');
assert.equal(getMetricTrendDirection(0), 'flat');
assert.equal(getMetricTrendSentiment(2), 'positive');
assert.equal(getMetricTrendSentiment(2, false), 'negative');
assert.equal(getMetricTrendSentiment(0), 'neutral');
assert.equal(calculateMetricDifferencePct(120, 100), 20);
assert.equal(calculateMetricDifferencePct(120, 0), null);
