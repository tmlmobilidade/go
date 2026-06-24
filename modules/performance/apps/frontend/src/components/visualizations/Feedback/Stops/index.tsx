/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Routes } from '@/routes';
import { type HubStop } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

import { buildStopLabelsById, getStopLabel } from '../network-labels';

/* * */

interface FeedbackPreviewResponse {
	rows: Record<string, unknown>[]
}

/* * */

function getStops(rows: Record<string, unknown>[]) {
	const stops = new Map<string, number>();

	for (const row of rows) {
		if (row.entity_type !== 'stop' || typeof row.entity_id !== 'string') continue;
		stops.set(row.entity_id, (stops.get(row.entity_id) ?? 0) + 1);
	}

	return Array.from(stops.entries())
		.map(([stopId, feedbackCount]) => ({ feedbackCount, stopId }))
		.sort((stopA, stopB) => stopB.feedbackCount - stopA.feedbackCount);
}

/* * */

export function FeedbackStops() {
	const { data, error, isLoading } = useSWR<FeedbackPreviewResponse, Error>(Routes.FEEDBACK_PREVIEW);
	const { data: stopsData } = useSWR<HubStop[], Error>({ credentials: 'omit', url: Routes.HUB_STOPS });
	const stopsById = useMemo(() => buildStopLabelsById(stopsData), [stopsData]);
	const stops = getStops(data?.rows ?? []);

	return (
		<ContainerWrapper>
			<h2 className={styles.title}>Todas as paragens</h2>

			{isLoading && <p className={styles.text}>A carregar paragens...</p>}
			{error && <p className={styles.text}>Erro ao carregar paragens.</p>}
			{!isLoading && !error && stops.length === 0 && <p className={styles.text}>Sem paragens para mostrar.</p>}

			{!isLoading && !error && stops.length > 0 && (
				<div className={styles.tableWrapper}>
					<table className={styles.table}>
						<thead>
							<tr>
								<th>Paragem</th>
								<th>Feedbacks</th>
							</tr>
						</thead>

						<tbody>
							{stops.map(stop => (
								<tr key={stop.stopId}>
									<td>{getStopLabel(stop.stopId, stopsById)}</td>
									<td>{stop.feedbackCount.toLocaleString('pt-PT')}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</ContainerWrapper>
	);
}
