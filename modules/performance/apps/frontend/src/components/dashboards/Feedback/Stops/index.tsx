/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackEntityDetailModal, FeedbackMetricTag } from '@/components/visualizations/Feedback';
import { FeedbackEntityDetailModalContextProvider } from '@/contexts/FeedbackEntityDetailModal.context';
import { FeedbackStopsViewContextProvider, type FeedbackStopViewItem, useFeedbackStopsViewContext } from '@/contexts/FeedbackStopsViewContext';
import { getStopLabel } from '@/utils/feedback/network-labels';
import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '@/utils/metrics/feedback-metrics';
import { FilterTypeList, SearchInput, SegmentedControl, Table, Text } from '@tmlmobilidade/ui';
import { type KeyboardEvent } from 'react';

import styles from './styles.module.css';

/* * */

function FeedbackStopsView() {
	//
	// A. Setup variables

	const viewContext = useFeedbackStopsViewContext();
	const { operatorFilter, sortOptions, stops, stopsById, stopSearchValue, stopSortMode } = viewContext.data;
	const { error, isLoading } = viewContext.flags;

	//
	// B. Handle actions

	const handleStopKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, stop: FeedbackStopViewItem) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		viewContext.actions.openStopDetail(stop);
	};

	//
	// C. Render components

	return (
		<>
			<div className={styles.dashboardContent}>
				<div className={styles.pageFilters}>
					<div className={styles.searchInput}>
						<SearchInput onChange={viewContext.actions.setStopSearchValue} value={stopSearchValue} />
					</div>

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
								<SegmentedControl data={sortOptions} onChange={viewContext.actions.setStopSortMode} value={stopSortMode} />
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
												onClick={() => viewContext.actions.openStopDetail(stop)}
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

			<FeedbackEntityDetailModal />
		</>
	);
}

export function FeedbackStops() {
	return (
		<FeedbackEntityDetailModalContextProvider>
			<FeedbackStopsViewContextProvider>
				<FeedbackStopsView />
			</FeedbackStopsViewContextProvider>
		</FeedbackEntityDetailModalContextProvider>
	);
}
