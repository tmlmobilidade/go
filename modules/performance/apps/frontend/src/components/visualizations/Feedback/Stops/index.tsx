/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Routes } from '@/routes';
import { type HubStop } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

import { formatSatisfactionIndex, getFeedbackSatisfactionByEntity, getFeedbackSatisfactionStatus } from '../feedback-metrics';
import { FeedbackMetricTag } from '../FeedbackMetricTag';
import { buildStopLabelsById, getStopLabel } from '../network-labels';

/* * */

interface FeedbackPreviewResponse {
	rows: Record<string, unknown>[]
}

/* * */

export function FeedbackStops() {
	const { data, error, isLoading } = useSWR<FeedbackPreviewResponse, Error>(Routes.FEEDBACK_PREVIEW);
	const { data: stopsData } = useSWR<HubStop[], Error>({ credentials: 'omit', url: Routes.HUB_STOPS });
	const stopsById = useMemo(() => buildStopLabelsById(stopsData), [stopsData]);
	const stops = getFeedbackSatisfactionByEntity(data?.rows ?? [], 'stop');

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
								<th>Índice de satisfação</th>
							</tr>
						</thead>

						<tbody>
							{stops.map(stop => (
								<tr key={stop.entityId}>
									<td>{getStopLabel(stop.entityId, stopsById)}</td>
									<td><FeedbackMetricTag label={stop.feedbackCount.toLocaleString('pt-PT')} /></td>
									<td><FeedbackMetricTag label={formatSatisfactionIndex(stop.satisfactionIndex)} status={getFeedbackSatisfactionStatus(stop.satisfactionIndex)} /></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</ContainerWrapper>
	);
}
