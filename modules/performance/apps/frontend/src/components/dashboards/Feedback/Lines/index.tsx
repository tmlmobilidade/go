/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackEntityDetailModal, FeedbackMetricTag, OperatorLogo } from '@/components/visualizations/Feedback';
import { useFeedbackOperatorFilter } from '@/hooks/feedback/use-feedback-operator-filter';
import { Routes } from '@/routes';
import { getFeedbackLineContributionMeters } from '@/utils/feedback/feedback-line-contributions';
import { buildLineLabelsById, type FeedbackNetworkLine, getLineLabel } from '@/utils/feedback/network-labels';
import { getOperatorName } from '@/utils/feedback/operators';
import { type FeedbackEntitySummary, formatSatisfactionIndex, getFeedbackEntitySummary, getFeedbackMetricsByEntity, getFeedbackSatisfactionStatus } from '@/utils/metrics/feedback-metrics';
import { type Agency, type PublicFeedback } from '@tmlmobilidade/types';
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

function sortLines(lines: ReturnType<typeof getFeedbackMetricsByEntity>, sortMode: FeedbackEntitySortMode, linesById: Map<string, string>) {
	return [...lines].sort((lineA, lineB) => {
		const feedbackCountDiff = lineB.feedbackCount - lineA.feedbackCount;
		const labelDiff = getLineLabel(lineA.entityId, linesById).localeCompare(getLineLabel(lineB.entityId, linesById), 'pt-PT');
		const satisfactionDiff = lineA.satisfactionIndex - lineB.satisfactionIndex;

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

function getOperatorLabel(operatorId: string, operatorsById: Map<string, Agency>) {
	const operator = operatorsById.get(operatorId);
	if (!operator) return operatorId;

	return getOperatorName(operator);
}

function LineOperatorCell({ operatorId, operatorsById }: { operatorId?: string, operatorsById: Map<string, Agency> }) {
	if (!operatorId) return <Text>-</Text>;

	return (
		<div className={styles.lineOperator}>
			<OperatorLogo className={styles.lineOperatorLogo} height={24} operatorId={operatorId} width={36} />
			<Text className={styles.lineOperatorName}>{getOperatorLabel(operatorId, operatorsById)}</Text>
		</div>
	);
}

/* * */

export function FeedbackLines() {
	//
	// A. Setup variables

	const [lineSortMode, setLineSortMode] = useState<FeedbackEntitySortMode>('feedback_count_desc');
	const [lineSearchValue, setLineSearchValue] = useState('');
	const [selectedLine, setSelectedLine] = useState<FeedbackEntitySummary>();

	//
	// B. Fetch data

	const { data, error, isLoading } = useSWR<PublicFeedback[], Error>(Routes.FEEDBACK_PREVIEW);
	const { data: linesData } = useSWR<FeedbackNetworkLine[], Error>({ credentials: 'omit', url: Routes.HUB_LINES });

	//
	// C. Transform data

	const operatorFilter = useFeedbackOperatorFilter(data, 'line');

	const linesById = useMemo(() => buildLineLabelsById(linesData), [linesData]);
	const lineMetrics = useMemo(() => getFeedbackMetricsByEntity(operatorFilter.rows, 'line'), [operatorFilter.rows]);
	const [debouncedLineSearchValue] = useDebouncedValue(lineSearchValue, 500);
	const normalizedLineSearchValue = useMemo(() => normalizeSearchValue(debouncedLineSearchValue), [debouncedLineSearchValue]);
	const lines = useMemo(() => {
		return sortLines(lineMetrics, lineSortMode, linesById)
			.filter(line => matchesSearch([
				line.entityId,
				getLineLabel(line.entityId, linesById),
				line.operatorId,
				line.operatorId ? getOperatorLabel(line.operatorId, operatorFilter.operatorsById) : undefined,
			], normalizedLineSearchValue));
	}, [lineMetrics, lineSortMode, linesById, normalizedLineSearchValue, operatorFilter.operatorsById]);

	//
	// D. Handle actions

	const handleOpenLineDetail = (line: typeof lines[number]) => {
		setSelectedLine(getFeedbackEntitySummary(line, 'line', linesById, getFeedbackLineContributionMeters(operatorFilter.rows, line)));
	};

	const handleCloseLineDetail = () => {
		setSelectedLine(undefined);
	};

	const handleChangeLineSortMode = (value: FeedbackEntitySortMode) => {
		setLineSortMode(value);
	};

	const handleLineKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, line: typeof lines[number]) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		handleOpenLineDetail(line);
	};

	//
	// E. Render components

	return (
		<>
			<div className={styles.dashboardContent}>
				<div className={styles.pageFilters}>
					<div className={styles.searchInput}>
						<SearchInput onChange={setLineSearchValue} value={lineSearchValue} />
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
								<SegmentedControl data={FEEDBACK_ENTITY_SORT_OPTIONS} onChange={handleChangeLineSortMode} value={lineSortMode} />
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
												onClick={() => handleOpenLineDetail(line)}
												onKeyDown={event => handleLineKeyDown(event, line)}
												role="button"
												tabIndex={0}
											>
												<Table.Td>
													<LineOperatorCell operatorId={line.operatorId} operatorsById={operatorFilter.operatorsById} />
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

			<FeedbackEntityDetailModal item={selectedLine} onClose={handleCloseLineDetail} />
		</>
	);
}
