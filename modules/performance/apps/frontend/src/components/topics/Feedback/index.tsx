/* * */

'use client';

import type { FeedbackTopicData } from '@/components/visualizations/Feedback';

import {
	FEEDBACK_TOPIC_PLACEHOLDER_DATA,
	FeedbackCategoryList,
	FeedbackChartCard,
	FeedbackSummaryGrid,
	TopFeedbackLines,
} from '@/components/visualizations/Feedback';
import { Routes } from '@/routes';
import { type TopLines30DayPerformance } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

interface FeedbackTopicProps {
	data?: FeedbackTopicData
	isLoading?: boolean
}

/* * */

export default function FeedbackTopic({ data, isLoading }: FeedbackTopicProps) {
	const { data: localMetricData, error: localMetricError, isLoading: isLoadingLocalMetric } = useSWR<TopLines30DayPerformance[]>(
		data ? null : Routes.TOP_LINES_30DAY_PERFORMANCE,
	);

	const fetchedFeedbackData = useMemo<FeedbackTopicData | null>(() => {
		const metric = localMetricData?.[0];
		if (!metric?.data) return null;

		const topLines = Object.entries(metric.data.top_performers)
			.map(([lineId, lineData]) => ({
				description: `${lineData.last_30_days_total.toLocaleString('pt-PT')} passageiros nos últimos 30 dias`,
				id: lineId,
				metric: `${lineData.increase_pct.toFixed(1)}%`,
				name: lineId,
				raw: lineData,
			}))
			.sort((a, b) => b.raw.last_30_days_total - a.raw.last_30_days_total);

		const worstLines = Object.entries(metric.data.worst_performers);
		const allLines = [...topLines, ...worstLines.map(([lineId, lineData]) => ({
			description: `${lineData.last_30_days_total.toLocaleString('pt-PT')} passageiros nos últimos 30 dias`,
			id: lineId,
			metric: `${lineData.increase_pct.toFixed(1)}%`,
			name: lineId,
			raw: lineData,
		}))];

		const totalPassengers = allLines.reduce((acc, line) => acc + line.raw.last_30_days_total, 0);
		const averageVariation = allLines.length
			? allLines.reduce((acc, line) => acc + line.raw.increase_pct, 0) / allLines.length
			: 0;
		const averageYtd = allLines.length
			? allLines.reduce((acc, line) => acc + line.raw.ytd_avg, 0) / allLines.length
			: 0;

		return {
			categories: [
				{ id: 'top-lines', label: 'Top positivas', value: topLines.length },
				{ id: 'worst-lines', label: 'Top negativas', value: worstLines.length },
				{ id: 'total-30-days', label: 'Total 30 dias', value: totalPassengers.toLocaleString('pt-PT') },
				{ id: 'avg-ytd', label: 'Média anual', value: Math.round(averageYtd).toLocaleString('pt-PT') },
			],
			chartBars: topLines.slice(0, 6).map(line => ({
				id: line.id,
				label: String(line.name),
				value: line.raw.last_30_days_total,
			})),
			chartTitle: 'Top linhas por total nos últimos 30 dias',
			summaryCards: [
				{
					description: 'linhas carregadas da métrica local',
					id: 'loaded-lines',
					label: 'Linhas',
					value: allLines.length,
				},
				{
					description: 'variação média vs. média anual',
					id: 'average-variation',
					label: 'Variação média',
					value: `${averageVariation.toFixed(1)}%`,
				},
				{
					description: 'passageiros nas linhas listadas',
					id: 'total-passengers',
					label: 'Total 30 dias',
					value: totalPassengers.toLocaleString('pt-PT'),
				},
			],
			topLines: topLines.slice(0, 6).map(line => ({
				description: line.description,
				id: line.id,
				metric: line.metric,
				name: line.name,
			})),
		};
	}, [localMetricData]);

	const feedbackData = data ?? fetchedFeedbackData ?? FEEDBACK_TOPIC_PLACEHOLDER_DATA;
	const isPending = isLoading ?? (!data && !localMetricError && isLoadingLocalMetric);

	return (
		<div className={styles.container}>
			<FeedbackSummaryGrid cards={feedbackData.summaryCards} isLoading={isPending} />

			<section className={styles.contentGrid}>
				<FeedbackChartCard bars={feedbackData.chartBars} isLoading={isPending} title={feedbackData.chartTitle} />
				<FeedbackCategoryList categories={feedbackData.categories} isLoading={isPending} />
			</section>

			<TopFeedbackLines isLoading={isPending} lines={feedbackData.topLines} title={fetchedFeedbackData ? 'Listagem básica do BD local' : undefined} />
		</div>
	);
}

//
