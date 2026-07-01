/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Routes } from '@/routes';
import { type HubStop, type PublicFeedback } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { type KeyboardEvent, useMemo, useState } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

import { FeedbackEntityDetailModal } from '../common/FeedbackEntityDetailModal';
import { FeedbackMetricTag } from '../common/FeedbackMetricTag';
import { useFeedbackOperatorFilter } from '../hooks/use-feedback-operator-filter';
import { type FeedbackEntitySummary, getFeedbackEntitySummary } from '../utils/feedback-entities';
import { formatSatisfactionIndex, getFeedbackMetricsByEntity, getFeedbackSatisfactionStatus } from '../utils/feedback-metrics';
import { buildStopLabelsById, getStopLabel } from '../utils/network-labels';

/* * */

export function FeedbackStops() {
	//
	// A. Setup variables

	const [selectedStop, setSelectedStop] = useState<FeedbackEntitySummary>();

	//
	// B. Fetch data

	const { data, error, isLoading } = useSWR<PublicFeedback[], Error>(Routes.FEEDBACK_PREVIEW);
	const { data: stopsData } = useSWR<HubStop[], Error>({ credentials: 'omit', url: Routes.HUB_STOPS });

	//
	// C. Transform data

	const operatorFilter = useFeedbackOperatorFilter(data, 'stop');

	const stopsById = useMemo(() => buildStopLabelsById(stopsData), [stopsData]);
	const stops = useMemo(() => getFeedbackMetricsByEntity(operatorFilter.rows, 'stop'), [operatorFilter.rows]);

	//
	// D. Handle actions

	const handleOpenStopDetail = (stop: typeof stops[number]) => {
		setSelectedStop(getFeedbackEntitySummary(stop, 'stop', stopsById));
	};

	const handleCloseStopDetail = () => {
		setSelectedStop(undefined);
	};

	const handleStopKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, stop: typeof stops[number]) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		handleOpenStopDetail(stop);
	};

	//
	// E. Render components

	return (
		<>
			<ContainerWrapper className={styles.container} padding="0">
				<div className={styles.header}>
					<h2 className={styles.title}>Todas as paragens</h2>

					<div className={styles.headerFilters}>
						<FilterTypeList
							active={operatorFilter.isActive}
							label="Operador"
							onChange={operatorFilter.onChange}
							options={operatorFilter.options}
							isMultiple
							withToggleAll
						/>
					</div>
				</div>

				<div className={styles.content}>
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
										<tr
											key={stop.entityId}
											aria-label={`Abrir detalhe da paragem ${getStopLabel(stop.entityId, stopsById)}`}
											className={styles.tableRowButton}
											onClick={() => handleOpenStopDetail(stop)}
											onKeyDown={event => handleStopKeyDown(event, stop)}
											role="button"
											tabIndex={0}
										>
											<td>{getStopLabel(stop.entityId, stopsById)}</td>
											<td><FeedbackMetricTag label={stop.feedbackCount.toLocaleString('pt-PT')} /></td>
											<td><FeedbackMetricTag label={formatSatisfactionIndex(stop.satisfactionIndex)} status={getFeedbackSatisfactionStatus(stop.satisfactionIndex)} /></td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</ContainerWrapper>

			<FeedbackEntityDetailModal item={selectedStop} onClose={handleCloseStopDetail} />
		</>
	);
}
