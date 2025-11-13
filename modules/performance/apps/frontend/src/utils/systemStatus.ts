/* * */

import { SystemStatusType } from '@/constants';

import config from './systemStatusConfig.json';

/* * */

interface MetricValue {
	last_week: number
	now: number
}

type MetricsData = Record<string, MetricValue>;

// change to allow 2 types (one with comparison, one without)
interface MetricsConfig {
	comparison_to?: string
	goal: 'decrease' | 'increase'
	target?: number | number[]
	trend_weight?: number
	weight: number
}

export interface StatusInfo {
	color: string
	label: string
	status: SystemStatusType
	value: number
}

/**
 * Compute a friendly status info (color, label, status) based on a system health value.
 * @param globalIndex Value between 0–100 or 0–1
 * @param t Translation function
 */
export function getSystemStatusInfo(globalIndex: number, t): StatusInfo {
	const formattedHealth = globalIndex > 1 ? globalIndex : globalIndex * 100;
	const healthPct = formattedHealth.toFixed(1);

	if (formattedHealth < 75) {
		return {
			color: 'var(--color-status-danger-primary)',
			label: t('systemStatus.negative', { value: `${healthPct}%` }),
			status: 'negative',
			value: formattedHealth,
		};
	}
	else if (formattedHealth < 90) {
		return {
			color: 'var(--color-status-warning-primary)',
			label: t('systemStatus.warning', { value: `${healthPct}%` }),
			status: 'warning',
			value: formattedHealth,
		};
	}
	else {
		return {
			color: 'var(--color-status-success-primary)',
			label: t('systemStatus.positive', { value: `${healthPct}%` }),
			status: 'positive',
			value: formattedHealth,
		};
	}
}

/**
 * Calculates a performance score (0–1) showing how close a metric value is to its target.
 *
 * - Works with single or range targets (e.g. `0.9` or `[0.9, 0.95]`).
 * - The result is always between 0 (poor) and 1 (ideal).
 * - For `goal = 'increase'`, higher values are better.
 * - For `goal = 'decrease'`, lower values are better.
 *
 * Scoring logic:
 * - Outside target → penalized proportionally (0–0.7)
 * - Inside target → smooth scale (0.7–1)
 * - Beyond ideal → full score (1)
 *
 * @param {number} baseNow - Current metric value.
 * @param {number | number[]} target - Target value or [min, max] range.
 * @param {'increase' | 'decrease'} goal - Whether higher or lower values are preferred.
 * @returns {number} Score between 0 and 1.
 */
function calculateTargetScore(baseNow: number, target: number | number[], goal: 'decrease' | 'increase') {
	const [targetMin, targetMax] = Array.isArray(target) ? target : [target, target];

	if (goal === 'increase') {
		if (baseNow < targetMin) {
			// Below target: penalize proportionally
			return Math.max(0, baseNow / targetMin * 0.7); // 0–0.7
		}
		else if (baseNow >= targetMin && baseNow <= targetMax) {
			// Inside target: moderate score 0.7–1
			return 0.7 + ((baseNow - targetMin) / (targetMax - targetMin)) * 0.3;
		}
		else {
			// Above target: full score
			return 1;
		}
	}
	else { // decrease
		if (baseNow > targetMax) {
			// Above target: penalize proportionally
			return Math.max(0, (targetMax / baseNow) * 0.7);
		}
		else if (baseNow >= targetMin && baseNow <= targetMax) {
			// Inside target: moderate score 0.7–1
			return 0.7 + ((targetMax - baseNow) / (targetMax - targetMin)) * 0.3;
		}
		else {
			// Below target: full score
			return 1;
		}
	}
}

/**
 * Calculates the global operational performance index based on multiple weighted metrics.
 *
 * Each metric can:
 * - Stand alone (trend-only metric - now vs last week)
 * - Be compared against another (e.g., valid_rides vs scheduled_rides)
 *
 * Scoring logic per metric:
 * 1. **Normalization:** Converts raw values into comparable ratios (e.g., 0.88 of scheduled rides).
 * 2. **Target score:** Measures how close the value is to the configured target range.
 * 3. **Trend score:** Compares current performance vs last week.
 * 4. **Final score:** Combines both, weighted by `trend_weight`.
 * 5. **Global index:** Weighted average of all metric scores, where total weight = 1.
 *
 * @param {MetricsData} metrics - Object with metric values.
 * @param {Object} options - Optional settings.
 * @param {boolean} options.verbose - Whether to log detailed calculation steps.
 * @returns {Object} Object containing breakdown and globalIndex.
 */
export function calculateSystemHealthIndex(metrics: MetricsData, { verbose = false } = {}) {
	let totalWeight = 0;
	let totalScore = 0;
	const breakdown = [];

	for (const [metric, conf] of Object.entries(config as Record<string, MetricsConfig>)) {
		const data = metrics[metric];
		if (!data) continue;

		const { last_week, now } = data;
		const comparisonMetric = conf.comparison_to ? metrics[conf.comparison_to] : null;

		// --- Handle relative metrics (percentage-based if comparison exists)
		let baseNow = now;
		let baseLastWeek = last_week;

		if (comparisonMetric) {
			baseNow = (now / (comparisonMetric.now || 1));
			baseLastWeek = (last_week / (comparisonMetric.last_week || 1));
		}

		const isIncrease = conf.goal === 'increase';

		// --- If there's no comparison metric, focus only on trend
		const useTrendOnly = !comparisonMetric;

		// --- Target normalization
		const [targetMin, targetMax] = Array.isArray(conf.target)
			? conf.target
			: [conf.target, conf.target];

		// --- Target adherence (only if not trend-only)
		let targetScore = 1;
		if (!useTrendOnly) {
			targetScore = calculateTargetScore(baseNow, conf.target, conf.goal);
		}

		// --- Trend performance (vs last week)
		const change = baseNow - baseLastWeek;
		const changePct = (change / (baseLastWeek || 1)) * 100;

		let trendScore;
		if (isIncrease) {
			trendScore = change > 0 ? 1 : 1 + changePct / 100;
		}
		else {
			trendScore = change < 0 ? 1 : 1 - changePct / 100;
		}
		trendScore = Math.min(1, Math.max(0, trendScore)); // clamp 0–1

		// --- Combine
		const trendWeight = conf.trend_weight ?? (useTrendOnly ? 1 : 0.2);
		const finalMetricScore = (1 - trendWeight) * targetScore + trendWeight * trendScore;

		const weightedScore = finalMetricScore * conf.weight;
		totalScore += weightedScore;
		totalWeight += conf.weight;

		// Disable lint ordering for this object for clarity

		const detail: Record<string, boolean | number | number[] | string> = {};

		detail.metric = metric;
		detail.goal = conf.goal;
		detail.comparison_to = conf.comparison_to || null;

		detail.now = Number(baseNow.toFixed(2));
		detail.last_week = Number(baseLastWeek.toFixed(2));
		detail.changePct = Number(changePct.toFixed(2));

		detail.target = [targetMin, targetMax];
		detail.useTrendOnly = useTrendOnly;

		detail.trendScore = Number((trendScore * 100).toFixed(3));
		detail.trendWeight = trendWeight;
		detail.targetScore = Number((targetScore * 100).toFixed(3));
		detail.targetWeight = 1 - trendWeight;
		detail.weight = conf.weight;
		detail.finalMetricScore = Number((finalMetricScore * 100).toFixed(3));
		detail.weightedScore = Number((weightedScore * 100).toFixed(3));

		breakdown.push(detail);
	}

	const globalIndex = totalWeight > 0 ? totalScore / totalWeight : 0;

	if (verbose) {
		console.group('🔍 System Health Index Calculation Log');
		breakdown.forEach((b) => {
			console.group(`📊 ${b.metric}`);
			console.table(b);
			console.groupEnd();
		});
		console.log('⚙️ Final Global Index:', (globalIndex * 100).toFixed(2) + '%');
		console.groupEnd();
	}

	return {
		breakdown,
		globalIndex,
	};
}
