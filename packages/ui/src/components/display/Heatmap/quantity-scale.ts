/* * */

import { type HeatmapLegendItem, type HeatmapTone } from '.';

/* * */

const QUANTITY_TONES = ['intensity-1', 'intensity-2', 'intensity-3', 'intensity-4', 'intensity-5'] as const satisfies HeatmapTone[];

/* * */

function roundThreshold(value: number, interval: number): number {
	const roundingUnit = 10 ** Math.floor(Math.log10(interval));
	return Number((Math.round(value / roundingUnit) * roundingUnit).toPrecision(12));
}

/* * */

export interface QuantityHeatmapScale {
	getTone: (value: number) => HeatmapTone
	legend: HeatmapLegendItem[]
}

/* * */

export function createQuantityHeatmapScale(
	values: number[],
	formatValue: (value: number) => string = String,
): QuantityHeatmapScale {
	const minimum = Math.min(...values);
	const maximum = Math.max(...values);

	if (!values.length || minimum === maximum) {
		return {
			getTone: () => 'intensity-3',
			legend: minimum === maximum && Number.isFinite(minimum)
				? [{ label: formatValue(minimum), tone: 'intensity-3' }]
				: [],
		};
	}

	const interval = (maximum - minimum) / QUANTITY_TONES.length;
	const thresholds = QUANTITY_TONES.slice(0, -1).map((_, index) => roundThreshold(minimum + interval * (index + 1), interval));
	const legend = QUANTITY_TONES.map((tone, index) => {
		const lowerThreshold = thresholds[index - 1];
		const upperThreshold = thresholds[index];
		const label = index === 0
			? `< ${formatValue(upperThreshold)}`
			: index === QUANTITY_TONES.length - 1
				? `≥ ${formatValue(lowerThreshold)}`
				: `${formatValue(lowerThreshold)}–${formatValue(upperThreshold)}`;

		return { label, tone };
	});

	return {
		getTone: (value) => {
			const toneIndex = thresholds.findIndex(threshold => value < threshold);
			return QUANTITY_TONES[toneIndex === -1 ? QUANTITY_TONES.length - 1 : toneIndex];
		},
		legend,
	};
}
