/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackEntityDetailModal, FeedbackMetricTag } from '@/components/visualizations/Feedback';
import { useFeedbackOperatorFilter } from '@/hooks/feedback/use-feedback-operator-filter';
import { Routes } from '@/routes';
import { type FeedbackEntitySummary, getFeedbackEntitySummary } from '@/utils/feedback/feedback-entities';
import { formatSatisfactionIndex, getFeedbackMetricsByEntity, getFeedbackSatisfactionStatus } from '@/utils/feedback/feedback-metrics';
import { buildStopLabelsById, getStopLabel } from '@/utils/feedback/network-labels';
import { type HubStop, type PublicFeedback } from '@tmlmobilidade/types';
import { FilterTypeList, SegmentedControl, Table, Text } from '@tmlmobilidade/ui';
import { type KeyboardEvent, useMemo, useState } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

type FeedbackEntitySortMode = 'feedback_count_desc' | 'satisfaction_asc' | 'satisfaction_desc';

const FEEDBACK_ENTITY_SORT_OPTIONS: { label: string, value: FeedbackEntitySortMode }[] = [
	{ label: 'Feedbacks', value: 'feedback_count_desc' },
	{ label: 'Maior índice', value: 'satisfaction_desc' },
	{ label: 'Menor índice', value: 'satisfaction_asc' },
];

function sortStops(stops: ReturnType<typeof getFeedbackMetricsByEntity>, sortMode: FeedbackEntitySortMode, stopsById: Map<string, string>) {
	return [...stops].sort((stopA, stopB) => {
		const feedbackCountDiff = stopB.feedbackCount - stopA.feedbackCount;
		const labelDiff = getStopLabel(stopA.entityId, stopsById).localeCompare(getStopLabel(stopB.entityId, stopsById), 'pt-PT');
		const satisfactionDiff = stopA.satisfactionIndex - stopB.satisfactionIndex;

		if (sortMode === 'feedback_count_desc') return feedbackCountDiff || labelDiff;
		if (sortMode === 'satisfaction_asc') return satisfactionDiff || feedbackCountDiff || labelDiff;
		return (satisfactionDiff * -1) || feedbackCountDiff || labelDiff;
	});
}

/* * */

export function FeedbackStops() {
	//
	// A. Setup variables

	const [stopSortMode, setStopSortMode] = useState<FeedbackEntitySortMode>('feedback_count_desc');
	const [selectedStop, setSelectedStop] = useState<FeedbackEntitySummary>();

	//
	// B. Fetch data

	const { data, error, isLoading } = useSWR<PublicFeedback[], Error>(Routes.FEEDBACK_PREVIEW);
	const { data: stopsData } = useSWR<HubStop[], Error>({ credentials: 'omit', url: Routes.HUB_STOPS });

	//
	// C. Transform data

	const operatorFilter = useFeedbackOperatorFilter(data, 'stop');

	const stopsById = useMemo(() => buildStopLabelsById(stopsData), [stopsData]);
	const stopMetrics = useMemo(() => getFeedbackMetricsByEntity(operatorFilter.rows, 'stop'), [operatorFilter.rows]);
	const stops = useMemo(() => sortStops(stopMetrics, stopSortMode, stopsById), [stopMetrics, stopSortMode, stopsById]);

	//
	// D. Handle actions

	const handleOpenStopDetail = (stop: typeof stops[number]) => {
		setSelectedStop(getFeedbackEntitySummary(stop, 'stop', stopsById));
	};

	const handleCloseStopDetail = () => {
		setSelectedStop(undefined);
	};

	const handleChangeStopSortMode = (value: FeedbackEntitySortMode) => {
		setStopSortMode(value);
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
			<div className={styles.dashboardContent}>
				<div className={styles.pageFilters}>
					<FilterTypeList
						active={operatorFilter.isActive}
						label="Operador"
						onChange={operatorFilter.onChange}
						options={operatorFilter.options}
						isMultiple
						withToggleAll
					/>
				</div>

				<ContainerWrapper className={styles.container} padding="0">
					<div className={styles.header}>
						<h2 className={styles.title}>Todas as paragens</h2>

						<div className={styles.headerControls}>
							<div className={styles.sortControl}>
								<h3 className={styles.controlLabel}>Ordenar</h3>
								<SegmentedControl data={FEEDBACK_ENTITY_SORT_OPTIONS} onChange={handleChangeStopSortMode} value={stopSortMode} />
							</div>
						</div>
					</div>

					<div className={styles.content}>
						{isLoading && <p className={styles.text}>A carregar paragens...</p>}
						{error && <p className={styles.text}>Erro ao carregar paragens.</p>}
						{!isLoading && !error && stops.length === 0 && <p className={styles.text}>Sem paragens para mostrar.</p>}

						{!isLoading && !error && stops.length > 0 && (
							<div className={styles.tableWrapper}>
								<Table highlightOnHover striped>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Paragem</Table.Th>
											<Table.Th>Feedbacks</Table.Th>
											<Table.Th>Índice de satisfação</Table.Th>
										</Table.Tr>
									</Table.Thead>

									<Table.Tbody>
										{stops.map(stop => (
											<Table.Tr
												key={stop.entityId}
												aria-label={`Abrir detalhe da paragem ${getStopLabel(stop.entityId, stopsById)}`}
												className={styles.tableRowButton}
												onClick={() => handleOpenStopDetail(stop)}
												onKeyDown={event => handleStopKeyDown(event, stop)}
												role="button"
												tabIndex={0}
											>
												<Table.Td>
													<Text>{getStopLabel(stop.entityId, stopsById)}</Text>
												</Table.Td>
												<Table.Td>
													<FeedbackMetricTag label={stop.feedbackCount.toLocaleString('pt-PT')} />
												</Table.Td>
												<Table.Td>
													<FeedbackMetricTag label={formatSatisfactionIndex(stop.satisfactionIndex)} status={getFeedbackSatisfactionStatus(stop.satisfactionIndex)} />
												</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</div>
						)}
					</div>
				</ContainerWrapper>
			</div>

			<FeedbackEntityDetailModal item={selectedStop} onClose={handleCloseStopDetail} />
		</>
	);
}
