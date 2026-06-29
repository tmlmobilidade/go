/* * */

'use client';

/* * */

import type { FeedbackEntitySummary } from './feedback-entities';
import type { FeedbackLineContributionCategory } from './feedback-line-contributions';

import { BarChart, CloseButton, Divider, Label, Modal, Pane, Section, Toolbar } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';

import styles from './styles.module.css';

import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from './feedback-metrics';
import { FeedbackMetricTag } from './FeedbackMetricTag';

/* * */

const LINE_CONTRIBUTION_CHART_SERIES = [
	{
		color: 'var(--color-primary)',
		label: 'Feedbacks',
		name: 'value',
	},
];

/* * */

interface FeedbackEntityDetailModalProps {
	item?: FeedbackEntitySummary
	onClose: () => void
}

/* * */

export function FeedbackEntityDetailModal({ item, onClose }: FeedbackEntityDetailModalProps) {
	//
	// A. Setup variables

	const [selectedLineContributionCategory, setSelectedLineContributionCategory] = useState<FeedbackLineContributionCategory>();

	//
	// B. Transform data

	const selectedLineContributionMeter = useMemo(() => {
		return item?.lineContributionMeters?.find(meter => meter.id === selectedLineContributionCategory && meter.selectable);
	}, [item?.lineContributionMeters, selectedLineContributionCategory]);

	const lineContributionChartData = item?.lineContributionMeters?.map(meter => ({
		color: meter.id === selectedLineContributionCategory ? 'var(--color-primary)' : 'var(--color-system-text-300)',
		id: meter.id,
		label: meter.label,
		selectable: meter.selectable,
		value: meter.value,
	})) ?? [];

	const lineContributionReasonChartData = selectedLineContributionMeter?.reasons.map(reason => ({
		label: reason.label,
		value: reason.value,
	})) ?? [];

	//
	// C. Handle actions

	useEffect(() => {
		setSelectedLineContributionCategory(undefined);
	}, [item?.id]);

	const handleSelectLineContributionCategory = (categoryId: FeedbackLineContributionCategory) => {
		const selectedChartItem = lineContributionChartData.find(chartItem => chartItem.id === categoryId);

		if (!selectedChartItem?.selectable) return;
		setSelectedLineContributionCategory(selectedChartItem.id);
	};

	//
	// D. Render components

	return (
		<Modal onClose={onClose} opened={Boolean(item)} padding={0} size="xl" withCloseButton={false} centered>
			{item && (
				<Pane
					header={[
						<Toolbar key="feedback-entity-detail-toolbar">
							<CloseButton onClick={onClose} type="close" />
							<div className={styles.feedbackEntityModalTitle}>
								<Label size="sm" variant="muted">{item.id}</Label>
								<Label size="lg">{item.label}</Label>
							</div>
						</Toolbar>,
					]}
				>
					{item.lineContributionMeters && (
						<>
							<Section gap="sm">
								<Label size="sm" caps>Composição dos feedbacks</Label>
								<div className={`${styles.feedbackEntityModalChartContainer} ${styles.feedbackEntityModalContributionChart}`}>
									<BarChart
										barChartProps={{ accessibilityLayer: false }}
										data={lineContributionChartData}
										dataKey="label"
										h={220}
										series={LINE_CONTRIBUTION_CHART_SERIES}
										valueFormatter={value => formatSatisfactionIndex(Number(value))}
										valueLabelProps={{ fill: 'white', position: 'inside' }}
										withXAxis={false}
										withYAxis={true}
										yAxisProps={{ domain: [0, 100], tickFormatter: value => formatSatisfactionIndex(Number(value)), width: 56 }}
										withBarValueLabel
									/>
									<div className={styles.feedbackEntityModalContributionButtons}>
										{lineContributionChartData.map(chartItem => (
											<button
												key={chartItem.id}
												aria-pressed={chartItem.id === selectedLineContributionCategory}
												className={`${styles.feedbackEntityModalContributionButton} ${chartItem.id === selectedLineContributionCategory ? styles.feedbackEntityModalContributionButtonSelected : ''}`}
												disabled={!chartItem.selectable}
												onClick={() => handleSelectLineContributionCategory(chartItem.id)}
												type="button"
											>
												{chartItem.label}
											</button>
										))}
									</div>
								</div>

								{selectedLineContributionMeter && lineContributionReasonChartData.length > 0 && (
									<div className={`${styles.feedbackEntityModalChartContainer} ${styles.feedbackEntityModalReasonChart}`}>
										<Label size="sm" caps>{selectedLineContributionMeter.label}</Label>
										<BarChart
											barChartProps={{ accessibilityLayer: false }}
											data={lineContributionReasonChartData}
											dataKey="label"
											h={Math.max(180, lineContributionReasonChartData.length * 44)}
											orientation="vertical"
											series={LINE_CONTRIBUTION_CHART_SERIES}
											valueFormatter={value => formatSatisfactionIndex(Number(value))}
											valueLabelProps={{ fill: 'var(--color-system-text-100)', position: 'right' }}
											withXAxis={true}
											withYAxis={true}
											xAxisProps={{ domain: [0, 100], tickFormatter: value => formatSatisfactionIndex(Number(value)) }}
											yAxisProps={{ width: 180 }}
											withBarValueLabel
										/>
									</div>
								)}
							</Section>

							<Divider />
						</>
					)}

					<Section gap="sm">
						<Label size="sm" caps>Resumo</Label>
						<div className={styles.feedbackEntityModalMetrics}>
							<div className={styles.feedbackEntityModalMetric}>
								<span className={styles.feedbackEntityModalMetricLabel}>Feedbacks</span>
								<FeedbackMetricTag label={item.count.toLocaleString('pt-PT')} />
							</div>

							<div className={styles.feedbackEntityModalMetric}>
								<span className={styles.feedbackEntityModalMetricLabel}>Satisfação</span>
								<FeedbackMetricTag label={formatSatisfactionIndex(item.satisfactionIndex)} status={getFeedbackSatisfactionStatus(item.satisfactionIndex)} />
							</div>
						</div>
					</Section>
				</Pane>
			)}
		</Modal>
	);
}
