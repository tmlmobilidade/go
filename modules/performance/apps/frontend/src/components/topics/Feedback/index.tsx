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
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

interface FeedbackTopicProps {
	data?: FeedbackTopicData
	isLoading?: boolean
}

interface FeedbackPreviewResponse {
	columns: string[]
	rows: Record<string, unknown>[]
	source: {
		database: string
		table: string
	}
}

/* * */

const NAME_FIELD_CANDIDATES = ['line_id', 'lineId', 'linha', 'route_id', 'routeId', 'id', '_id'];
const METRIC_FIELD_CANDIDATES = ['feedback_count', 'feedbacks', 'rating', 'score', 'value', 'count', 'qty', 'total'];

/* * */

function formatPreviewValue(value: unknown) {
	if (value === null || value === undefined || value === '') return '-';
	if (typeof value === 'number') return value.toLocaleString('pt-PT');
	if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
	if (typeof value === 'string') return value;

	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

function getCandidateField(row: Record<string, unknown>, candidates: string[]) {
	return candidates.find(field => row[field] !== null && row[field] !== undefined && row[field] !== '');
}

function getFirstStringField(row: Record<string, unknown>) {
	return Object.entries(row).find(([, value]) => typeof value === 'string' && value.trim().length > 0)?.[0];
}

function getFirstNumericField(row: Record<string, unknown>) {
	return Object.entries(row).find(([, value]) => typeof value === 'number')?.[0];
}

function getNumericValue(row: Record<string, unknown>, fallback: number) {
	const metricField = getCandidateField(row, METRIC_FIELD_CANDIDATES);
	const numericField = metricField && typeof row[metricField] === 'number' ? metricField : getFirstNumericField(row);
	if (!numericField) return fallback;
	return Number(row[numericField]);
}

/* * */

export default function FeedbackTopic({ data, isLoading }: FeedbackTopicProps) {
	const { data: feedbackPreviewData, error: feedbackPreviewError, isLoading: isLoadingFeedbackPreview } = useSWR<FeedbackPreviewResponse>(
		data ? null : Routes.FEEDBACK_PREVIEW,
	);

	const fetchedFeedbackData = useMemo<FeedbackTopicData | null>(() => {
		if (!feedbackPreviewData) return null;

		const rows = feedbackPreviewData.rows;
		const columns = feedbackPreviewData.columns;
		const numericColumns = columns.filter(column => rows.some(row => typeof row[column] === 'number'));

		const previewRows = rows.slice(0, 6).map((row, index) => {
			const nameField = getCandidateField(row, NAME_FIELD_CANDIDATES) ?? getFirstStringField(row);
			const metricField = getCandidateField(row, METRIC_FIELD_CANDIDATES) ?? getFirstNumericField(row);
			const description = Object.entries(row)
				.filter(([field]) => field !== nameField && field !== metricField)
				.slice(0, 2)
				.map(([field, value]) => `${field}: ${formatPreviewValue(value)}`)
				.join(' · ');

			return {
				description,
				id: String(row._id ?? row.id ?? index),
				metric: metricField ? formatPreviewValue(row[metricField]) : undefined,
				name: nameField ? formatPreviewValue(row[nameField]) : `Registo ${index + 1}`,
				raw: row,
			};
		});

		return {
			categories: columns.slice(0, 4).map(column => ({
				id: column,
				label: column,
				value: `${rows.filter(row => row[column] !== null && row[column] !== undefined && row[column] !== '').length}/${rows.length}`,
			})),
			chartBars: rows.slice(0, 6).map((row, index) => ({
				id: String(row._id ?? row.id ?? index),
				label: previewRows[index]?.name ? String(previewRows[index].name) : `Registo ${index + 1}`,
				value: getNumericValue(row, rows.length - index),
			})),
			chartTitle: `Preview ${feedbackPreviewData.source.database}.${feedbackPreviewData.source.table}`,
			summaryCards: [
				{
					description: 'registos devolvidos pelo preview',
					id: 'rows',
					label: 'Registos',
					value: rows.length,
				},
				{
					description: 'colunas detetadas na tabela',
					id: 'columns',
					label: 'Colunas',
					value: columns.length,
				},
				{
					description: 'colunas com valores numéricos',
					id: 'numeric-columns',
					label: 'Métricas',
					value: numericColumns.length,
				},
			],
			topLines: previewRows.map(row => ({
				description: row.description,
				id: row.id,
				metric: row.metric,
				name: row.name,
			})),
		};
	}, [feedbackPreviewData]);

	const feedbackData = data ?? fetchedFeedbackData ?? FEEDBACK_TOPIC_PLACEHOLDER_DATA;
	const isPending = isLoading ?? (!data && !feedbackPreviewError && isLoadingFeedbackPreview);

	return (
		<div className={styles.container}>
			<FeedbackSummaryGrid cards={feedbackData.summaryCards} isLoading={isPending} />

			<section className={styles.contentGrid}>
				<FeedbackChartCard bars={feedbackData.chartBars} isLoading={isPending} title={feedbackData.chartTitle} />
				<FeedbackCategoryList categories={feedbackData.categories} isLoading={isPending} />
			</section>

			<TopFeedbackLines isLoading={isPending} lines={feedbackData.topLines} title={fetchedFeedbackData ? 'Preview da tabela feedback' : undefined} />
		</div>
	);
}

//
