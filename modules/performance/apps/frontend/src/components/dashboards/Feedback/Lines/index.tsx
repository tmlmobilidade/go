/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackEntityDetailModal, FeedbackMetricTag } from '@/components/visualizations/Feedback';
import { FeedbackEntityDetailModalContextProvider } from '@/contexts/FeedbackEntityDetailModal.context';
import { getLineLabel } from '@/utils/feedback/network-labels';
import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '@/utils/metrics/feedback-metrics';
import { AgencyTag, FilterTypeList, SearchInput, SegmentedControl, Table, Text } from '@tmlmobilidade/ui';
import { type KeyboardEvent } from 'react';

import styles from './styles.module.css';

import { FeedbackLinesViewContextProvider, type FeedbackLineViewItem, useFeedbackLinesViewContext } from './FeedbackLinesViewContext';

/* * */

function LineOperatorCell({ operatorId }: { operatorId?: string }) {
	if (!operatorId) return <Text>-</Text>;

	return (
		<div className={styles.lineOperator}>
			<AgencyTag agencyId={operatorId} showShortName />
		</div>
	);
}

/* * */

function FeedbackLinesView() {
	//
	// A. Setup variables

	const viewContext = useFeedbackLinesViewContext();
	const { lines, linesById, lineSearchValue, lineSortMode, operatorFilter, sortOptions } = viewContext.data;
	const { error, isLoading } = viewContext.flags;

	//
	// B. Handle actions

	const handleLineKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, line: FeedbackLineViewItem) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		viewContext.actions.openLineDetail(line);
	};

	//
	// C. Render components

	return (
		<>
			<div className={styles.dashboardContent}>
				<div className={styles.pageFilters}>
					<div className={styles.searchInput}>
						<SearchInput onChange={viewContext.actions.setLineSearchValue} value={lineSearchValue} />
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
						<h2 className={styles.title}>Todas as linhas</h2>

						<div className={styles.headerControls}>
							<div className={styles.sortControl}>
								<h3 className={styles.controlLabel}>Ordenar</h3>
								<SegmentedControl data={sortOptions} onChange={viewContext.actions.setLineSortMode} value={lineSortMode} />
							</div>
						</div>
					</div>

					<div className={styles.content}>
						{isLoading && <p className={styles.text}>A carregar linhas...</p>}
						{error && <p className={styles.text}>Erro ao carregar linhas.</p>}
						{!isLoading && !error && lines.length === 0 && <p className={styles.text}>Sem linhas para mostrar.</p>}

						{!isLoading && !error && lines.length > 0 && (
							<div className={styles.tableWrapper}>
								<Table highlightOnHover striped>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Operador</Table.Th>
											<Table.Th>Linha</Table.Th>
											<Table.Th>Feedbacks</Table.Th>
											<Table.Th>Índice de satisfação</Table.Th>
										</Table.Tr>
									</Table.Thead>

									<Table.Tbody>
										{lines.map(line => (
											<Table.Tr
												key={line.entityId}
												aria-label={`Abrir detalhe da linha ${getLineLabel(line.entityId, linesById)}`}
												className={styles.tableRowButton}
												onClick={() => viewContext.actions.openLineDetail(line)}
												onKeyDown={event => handleLineKeyDown(event, line)}
												role="button"
												tabIndex={0}
											>
												<Table.Td>
													<LineOperatorCell operatorId={line.operatorId} />
												</Table.Td>
												<Table.Td>
													<Text>{getLineLabel(line.entityId, linesById)}</Text>
												</Table.Td>
												<Table.Td>
													<FeedbackMetricTag label={line.feedbackCount.toLocaleString('pt-PT')} />
												</Table.Td>
												<Table.Td>
													<FeedbackMetricTag label={formatSatisfactionIndex(line.satisfactionIndex)} status={getFeedbackSatisfactionStatus(line.satisfactionIndex)} />
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

export function FeedbackLines() {
	return (
		<FeedbackEntityDetailModalContextProvider>
			<FeedbackLinesViewContextProvider>
				<FeedbackLinesView />
			</FeedbackLinesViewContextProvider>
		</FeedbackEntityDetailModalContextProvider>
	);
}
