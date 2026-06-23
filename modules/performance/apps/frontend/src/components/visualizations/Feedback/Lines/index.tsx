/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Routes } from '@/routes';
import { type HubLine } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

import { buildLineLabelsById, getLineLabel } from '../network-labels';

/* * */

interface FeedbackPreviewResponse {
	rows: Record<string, unknown>[]
}

/* * */

function getLines(rows: Record<string, unknown>[]) {
	const lines = new Map<string, number>();

	for (const row of rows) {
		if (row.entity_type !== 'line' || typeof row.entity_id !== 'string') continue;
		lines.set(row.entity_id, (lines.get(row.entity_id) ?? 0) + 1);
	}

	return Array.from(lines.entries())
		.map(([lineId, feedbackCount]) => ({ feedbackCount, lineId }))
		.sort((lineA, lineB) => lineB.feedbackCount - lineA.feedbackCount);
}

/* * */

export function FeedbackLines() {
	const { data, error, isLoading } = useSWR<FeedbackPreviewResponse, Error>(Routes.FEEDBACK_PREVIEW);
	const { data: linesData } = useSWR<HubLine[], Error>({ credentials: 'omit', url: Routes.HUB_LINES });
	const linesById = useMemo(() => buildLineLabelsById(linesData), [linesData]);
	const lines = getLines(data?.rows ?? []);

	return (
		<ContainerWrapper>
			<h2 className={styles.title}>Todas as linhas</h2>

			{isLoading && <p className={styles.text}>A carregar linhas...</p>}
			{error && <p className={styles.text}>Erro ao carregar linhas.</p>}
			{!isLoading && !error && lines.length === 0 && <p className={styles.text}>Sem linhas para mostrar.</p>}

			{!isLoading && !error && lines.length > 0 && (
				<div className={styles.tableWrapper}>
					<table className={styles.table}>
						<thead>
							<tr>
								<th>Linha</th>
								<th>Feedbacks</th>
							</tr>
						</thead>

						<tbody>
							{lines.map(line => (
								<tr key={line.lineId}>
									<td>{getLineLabel(line.lineId, linesById)}</td>
									<td>{line.feedbackCount.toLocaleString('pt-PT')}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</ContainerWrapper>
	);
}
