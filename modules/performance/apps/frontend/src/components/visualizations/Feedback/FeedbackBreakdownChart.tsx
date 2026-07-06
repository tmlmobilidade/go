/* * */

'use client';

/* * */

import { formatSatisfactionIndex } from '@/utils/metrics/feedback-metrics';
import { BarChart, Label, Section } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface FeedbackBreakdownReasonMeter {
	id: string
	label: string
	value: number
}

interface FeedbackBreakdownMeter<Category extends string> {
	id: Category
	label: string
	reasons: FeedbackBreakdownReasonMeter[]
	selectable: boolean
	value: number
}

interface FeedbackBreakdownChartProps<Category extends string> {
	categoryChartHeight: number
	categoryYAxisWidth: number
	compactButtons?: boolean
	entityId: string
	hideWhenEmpty?: boolean
	meters: FeedbackBreakdownMeter<Category>[]
	reasonChartMinHeight: number
	reasonChartRowHeight: number
	reasonChartYAxisWidth: number
}

/* * */

export function FeedbackBreakdownChart<Category extends string>({
	categoryChartHeight,
	categoryYAxisWidth,
	compactButtons,
	entityId,
	hideWhenEmpty,
	meters,
	reasonChartMinHeight,
	reasonChartRowHeight,
	reasonChartYAxisWidth,
}: FeedbackBreakdownChartProps<Category>) {
	//
	// A. Setup variables

	const t = useTranslations();
	const [selectedCategory, setSelectedCategory] = useState<Category>();

	//
	// B. Transform data

	const chartSeries = useMemo(() => [
		{
			color: 'var(--color-primary)',
			label: t('feedback.labels.feedbacks'),
			name: 'value',
		},
	], [t]);

	const selectedMeter = useMemo(() => {
		return meters.find(meter => meter.id === selectedCategory && meter.selectable);
	}, [meters, selectedCategory]);

	const chartData = useMemo(() => {
		return meters.map(meter => ({
			color: meter.id === selectedCategory ? 'var(--color-primary)' : 'var(--color-system-text-300)',
			id: meter.id,
			label: meter.label,
			selectable: meter.selectable,
			value: meter.value,
		}));
	}, [meters, selectedCategory]);

	const reasonChartData = selectedMeter?.reasons ?? [];

	//
	// C. Handle actions

	useEffect(() => {
		setSelectedCategory(undefined);
	}, [entityId]);

	const handleSelectCategory = (categoryId: Category) => {
		const chartItem = chartData.find(item => item.id === categoryId);

		if (!chartItem?.selectable) return;
		setSelectedCategory(currentCategory => (currentCategory === chartItem.id ? undefined : chartItem.id));
	};

	//
	// D. Render components

	if (hideWhenEmpty && meters.length === 0) return null;

	return (
		<Section gap="sm">
			<Label size="sm" caps>{t('feedback.labels.points_to_improve')}</Label>
			<div className={`${styles.feedbackEntityModalChartContainer} ${styles.feedbackEntityModalContributionChart}`}>
				<BarChart
					barChartProps={{ accessibilityLayer: false }}
					data={chartData}
					dataKey="label"
					h={categoryChartHeight}
					series={chartSeries}
					valueFormatter={value => formatSatisfactionIndex(Number(value))}
					valueLabelProps={{ fill: 'white', position: 'inside' }}
					withXAxis={false}
					withYAxis={true}
					yAxisProps={{ domain: [0, 100], tickFormatter: value => formatSatisfactionIndex(Number(value)), width: categoryYAxisWidth }}
					withBarValueLabel
				/>
				<div className={`${styles.feedbackEntityModalContributionButtons} ${compactButtons ? styles.feedbackEntityModalContributionButtonsCompact : ''}`}>
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
						h={Math.max(reasonChartMinHeight, reasonChartData.length * reasonChartRowHeight)}
						orientation="vertical"
						series={chartSeries}
						valueFormatter={value => formatSatisfactionIndex(Number(value))}
						valueLabelProps={{ fill: 'var(--color-system-text-100)', position: 'right' }}
						withXAxis={true}
						withYAxis={true}
						xAxisProps={{ domain: [0, 100], tickFormatter: value => formatSatisfactionIndex(Number(value)) }}
						yAxisProps={{ width: reasonChartYAxisWidth }}
						withBarValueLabel
					/>
				</div>
			)}
		</Section>
	);
}
