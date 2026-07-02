/* * */

'use client';

/* * */

import type { FeedbackStopReasonCategory, FeedbackStopReasonMeter } from '@/utils/feedback/feedback-stop-reasons';

import { formatSatisfactionIndex } from '@/utils/feedback/feedback-metrics';
import { BarChart, Label, Section } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';

import styles from '../styles.module.css';

/* * */

const STOP_REASON_CHART_SERIES = [
	{
		color: 'var(--color-primary)',
		label: 'Feedbacks',
		name: 'value',
	},
];

const STOP_CATEGORY_CHART_HEIGHT = 220;
const STOP_CATEGORY_Y_AXIS_WIDTH = 56;
const STOP_REASON_CHART_MIN_HEIGHT = 220;
const STOP_REASON_CHART_ROW_HEIGHT = 44;
const STOP_REASON_CHART_Y_AXIS_WIDTH = 220;

/* * */

interface StopReasonBreakdownProps {
	entityId: string
	meters: FeedbackStopReasonMeter[]
}

/* * */

export function StopReasonBreakdown({ entityId, meters }: StopReasonBreakdownProps) {
	const [selectedCategory, setSelectedCategory] = useState<FeedbackStopReasonCategory>();

	const selectedMeter = useMemo(() => {
		return meters.find(meter => meter.id === selectedCategory && meter.selectable);
	}, [meters, selectedCategory]);

	const chartData = meters.map(meter => ({
		color: meter.id === selectedCategory ? 'var(--color-primary)' : 'var(--color-system-text-300)',
		id: meter.id,
		label: meter.label,
		selectable: meter.selectable,
		value: meter.value,
	}));

	const reasonChartData = selectedMeter?.reasons ?? [];

	useEffect(() => {
		setSelectedCategory(undefined);
	}, [entityId]);

	const handleSelectCategory = (categoryId: FeedbackStopReasonCategory) => {
		const chartItem = chartData.find(item => item.id === categoryId);

		if (!chartItem?.selectable) return;
		setSelectedCategory(chartItem.id);
	};

	if (meters.length === 0) return null;

	return (
		<Section gap="sm">
			<Label size="sm" caps>Pontos a melhorar</Label>
			<div className={`${styles.feedbackEntityModalChartContainer} ${styles.feedbackEntityModalContributionChart}`}>
				<BarChart
					barChartProps={{ accessibilityLayer: false }}
					data={chartData}
					dataKey="label"
					h={STOP_CATEGORY_CHART_HEIGHT}
					series={STOP_REASON_CHART_SERIES}
					valueFormatter={value => formatSatisfactionIndex(Number(value))}
					valueLabelProps={{ fill: 'white', position: 'inside' }}
					withXAxis={false}
					withYAxis={true}
					yAxisProps={{ domain: [0, 100], tickFormatter: value => formatSatisfactionIndex(Number(value)), width: STOP_CATEGORY_Y_AXIS_WIDTH }}
					withBarValueLabel
				/>
				<div className={`${styles.feedbackEntityModalContributionButtons} ${styles.feedbackEntityModalStopReasonButtons}`}>
					{chartData.map(chartItem => (
						<button
							key={chartItem.id}
							aria-pressed={chartItem.id === selectedCategory}
							className={`${styles.feedbackEntityModalContributionButton} ${chartItem.id === selectedCategory ? styles.feedbackEntityModalContributionButtonSelected : ''}`}
							disabled={!chartItem.selectable}
							onClick={() => handleSelectCategory(chartItem.id)}
							type="button"
						>
							{chartItem.label}
						</button>
					))}
				</div>
			</div>

			{selectedMeter && reasonChartData.length > 0 && (
				<div className={`${styles.feedbackEntityModalChartContainer} ${styles.feedbackEntityModalReasonChart}`}>
					<Label size="sm" caps>{selectedMeter.label}</Label>
					<BarChart
						barChartProps={{ accessibilityLayer: false }}
						data={reasonChartData}
						dataKey="label"
						h={Math.max(STOP_REASON_CHART_MIN_HEIGHT, reasonChartData.length * STOP_REASON_CHART_ROW_HEIGHT)}
						orientation="vertical"
						series={STOP_REASON_CHART_SERIES}
						valueFormatter={value => formatSatisfactionIndex(Number(value))}
						valueLabelProps={{ fill: 'var(--color-system-text-100)', position: 'right' }}
						withXAxis={true}
						withYAxis={true}
						xAxisProps={{ domain: [0, 100], tickFormatter: value => formatSatisfactionIndex(Number(value)) }}
						yAxisProps={{ width: STOP_REASON_CHART_Y_AXIS_WIDTH }}
						withBarValueLabel
					/>
				</div>
			)}
		</Section>
	);
}
