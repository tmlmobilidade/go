/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackEntityDetailModal, FeedbackMetricTag } from '@/components/visualizations/Feedback';
import { useFeedbackOperatorFilter } from '@/hooks/feedback/use-feedback-operator-filter';
import { Routes } from '@/routes';
import { getFeedbackStopReasonMeters } from '@/utils/feedback/feedback-stop-reasons';
import { buildStopLabelsById, type FeedbackNetworkStop, getStopLabel } from '@/utils/feedback/network-labels';
import { type FeedbackEntitySummary, formatSatisfactionIndex, getFeedbackEntitySummary, getFeedbackMetricsByEntity, getFeedbackSatisfactionStatus } from '@/utils/metrics/feedback-metrics';
import { type PublicFeedback } from '@tmlmobilidade/types';
import { FilterTypeList, SearchInput, SegmentedControl, Table, Text, useDebouncedValue } from '@tmlmobilidade/ui';
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

function normalizeSearchValue(value: string) {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLocaleLowerCase('pt-PT')
		.trim();
}

function matchesSearch(fields: (string | undefined)[], searchValue: string) {
	if (!searchValue) return true;
	return fields.some(field => normalizeSearchValue(field ?? '').includes(searchValue));
}

/* * */

export function FeedbackStops() {
	//
	// A. Setup variables

	const [stopSortMode, setStopSortMode] = useState<FeedbackEntitySortMode>('feedback_count_desc');
	const [stopSearchValue, setStopSearchValue] = useState('');
	const [selectedStop, setSelectedStop] = useState<FeedbackEntitySummary>();

	//
	// B. Fetch data

	const { data, error, isLoading } = useSWR<PublicFeedback[], Error>(Routes.FEEDBACK_PREVIEW);
	const { data: stopsData } = useSWR<FeedbackNetworkStop[], Error>({ credentials: 'omit', url: Routes.HUB_STOPS });

	//
	// C. Transform data

	const operatorFilter = useFeedbackOperatorFilter(data, 'stop');

	const stopsById = useMemo(() => buildStopLabelsById(stopsData), [stopsData]);
	const stopMetrics = useMemo(() => getFeedbackMetricsByEntity(operatorFilter.rows, 'stop'), [operatorFilter.rows]);
	const [debouncedStopSearchValue] = useDebouncedValue(stopSearchValue, 800);
	const normalizedStopSearchValue = useMemo(() => normalizeSearchValue(debouncedStopSearchValue), [debouncedStopSearchValue]);
	const stops = useMemo(() => {
		return sortStops(stopMetrics, stopSortMode, stopsById)
			.filter(stop => matchesSearch([
				stop.entityId,
				getStopLabel(stop.entityId, stopsById),
			], normalizedStopSearchValue));
	}, [stopMetrics, stopSortMode, stopsById, normalizedStopSearchValue]);

	//
	// D. Handle actions

	const handleOpenStopDetail = (stop: typeof stops[number]) => {
		setSelectedStop(getFeedbackEntitySummary(stop, 'stop', stopsById, undefined, getFeedbackStopReasonMeters(operatorFilter.rows, stop)));
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
					<div className={styles.searchInput}>
						<SearchInput onChange={setStopSearchValue} value={stopSearchValue} />
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
