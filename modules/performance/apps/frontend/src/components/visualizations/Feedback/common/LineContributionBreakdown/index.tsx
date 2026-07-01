/* * */

'use client';

/* * */

import type { FeedbackLineContributionCategory, FeedbackLineContributionMeter } from '@/utils/feedback/feedback-line-contributions';

import { formatSatisfactionIndex } from '@/utils/feedback/feedback-metrics';
import { BarChart, Label, Section } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';

import styles from '../../styles.module.css';

/* * */

const LINE_CONTRIBUTION_CHART_SERIES = [
	{
		color: 'var(--color-primary)',
		label: 'Feedbacks',
		name: 'value',
	},
];

const LINE_CONTRIBUTION_CHART_HEIGHT = 220;
const LINE_CONTRIBUTION_Y_AXIS_WIDTH = 56;
const REASON_CHART_MIN_HEIGHT = 180;
const REASON_CHART_ROW_HEIGHT = 44;
const REASON_CHART_Y_AXIS_WIDTH = 180;

/* * */

interface LineContributionBreakdownProps {
	entityId: string
	meters: FeedbackLineContributionMeter[]
}

/* * */

export function LineContributionBreakdown({ entityId, meters }: LineContributionBreakdownProps) {
	//
	// A. Setup variables

	const [selectedCategory, setSelectedCategory] = useState<FeedbackLineContributionCategory>();

	//
	// B. Transform data

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

	//
	// C. Handle actions

	useEffect(() => {
		setSelectedCategory(undefined);
	}, [entityId]);

	const handleSelectCategory = (categoryId: FeedbackLineContributionCategory) => {
		const chartItem = chartData.find(item => item.id === categoryId);

		if (!chartItem?.selectable) return;
		setSelectedCategory(chartItem.id);
	};

	//
	// D. Render components

	return (
		<Section gap="sm">
			<Label size="sm" caps>Pontos a melhorar</Label>
			<div className={`${styles.feedbackEntityModalChartContainer} ${styles.feedbackEntityModalContributionChart}`}>
				<BarChart
					barChartProps={{ accessibilityLayer: false }}
					data={chartData}
					dataKey="label"
					h={LINE_CONTRIBUTION_CHART_HEIGHT}
					series={LINE_CONTRIBUTION_CHART_SERIES}
					valueFormatter={value => formatSatisfactionIndex(Number(value))}
					valueLabelProps={{ fill: 'white', position: 'inside' }}
					withXAxis={false}
					withYAxis={true}
					yAxisProps={{ domain: [0, 100], tickFormatter: value => formatSatisfactionIndex(Number(value)), width: LINE_CONTRIBUTION_Y_AXIS_WIDTH }}
					withBarValueLabel
				/>
				<div className={styles.feedbackEntityModalContributionButtons}>
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
						h={Math.max(REASON_CHART_MIN_HEIGHT, reasonChartData.length * REASON_CHART_ROW_HEIGHT)}
						orientation="vertical"
						series={LINE_CONTRIBUTION_CHART_SERIES}
						valueFormatter={value => formatSatisfactionIndex(Number(value))}
						valueLabelProps={{ fill: 'var(--color-system-text-100)', position: 'right' }}
						withXAxis={true}
						withYAxis={true}
						xAxisProps={{ domain: [0, 100], tickFormatter: value => formatSatisfactionIndex(Number(value)) }}
						yAxisProps={{ width: REASON_CHART_Y_AXIS_WIDTH }}
						withBarValueLabel
					/>
				</div>
			)}
		</Section>
	);
}
