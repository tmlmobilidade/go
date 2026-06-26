/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Routes } from '@/routes';
import { type HubLine, type PublicFeedback } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

import { formatSatisfactionIndex, getFeedbackMetricsByEntity, getFeedbackSatisfactionStatus } from '../feedback-metrics';
import { FeedbackMetricTag } from '../FeedbackMetricTag';
import { buildLineLabelsById, getLineLabel } from '../network-labels';

/* * */

export function FeedbackLines() {
	const { data, error, isLoading } = useSWR<PublicFeedback[], Error>(Routes.FEEDBACK_PREVIEW);
	const { data: linesData } = useSWR<HubLine[], Error>({ credentials: 'omit', url: Routes.HUB_LINES });
	const linesById = useMemo(() => buildLineLabelsById(linesData), [linesData]);
	const lines = getFeedbackMetricsByEntity(data ?? [], 'line');

	return (
		<ContainerWrapper className={styles.container} padding="0">
			<div className={styles.header}>
				<h2 className={styles.title}>Todas as linhas</h2>
			</div>

			<div className={styles.content}>
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
									<th>Índice de satisfação</th>
								</tr>
							</thead>

							<tbody>
								{lines.map(line => (
									<tr key={line.entityId}>
										<td>{getLineLabel(line.entityId, linesById)}</td>
										<td><FeedbackMetricTag label={line.feedbackCount.toLocaleString('pt-PT')} /></td>
										<td><FeedbackMetricTag label={formatSatisfactionIndex(line.satisfactionIndex)} status={getFeedbackSatisfactionStatus(line.satisfactionIndex)} /></td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</ContainerWrapper>
	);
}
