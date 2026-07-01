/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackEntityDetailModal, FeedbackMetricTag } from '@/components/visualizations/Feedback';
import { useFeedbackOperatorFilter } from '@/hooks/feedback/use-feedback-operator-filter';
import { Routes } from '@/routes';
import { type FeedbackEntitySummary, getFeedbackEntitySummary } from '@/utils/feedback/feedback-entities';
import { getFeedbackLineContributionMeters } from '@/utils/feedback/feedback-line-contributions';
import { formatSatisfactionIndex, getFeedbackMetricsByEntity, getFeedbackSatisfactionStatus } from '@/utils/feedback/feedback-metrics';
import { buildLineLabelsById, getLineLabel } from '@/utils/feedback/network-labels';
import { type HubLine, type PublicFeedback } from '@tmlmobilidade/types';
import { FilterTypeList, Table, Text } from '@tmlmobilidade/ui';
import { type KeyboardEvent, useMemo, useState } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function FeedbackLines() {
	//
	// A. Setup variables

	const [selectedLine, setSelectedLine] = useState<FeedbackEntitySummary>();

	//
	// B. Fetch data

	const { data, error, isLoading } = useSWR<PublicFeedback[], Error>(Routes.FEEDBACK_PREVIEW);
	const { data: linesData } = useSWR<HubLine[], Error>({ credentials: 'omit', url: Routes.HUB_LINES });

	//
	// C. Transform data

	const operatorFilter = useFeedbackOperatorFilter(data, 'line');

	const linesById = useMemo(() => buildLineLabelsById(linesData), [linesData]);
	const lines = useMemo(() => getFeedbackMetricsByEntity(operatorFilter.rows, 'line'), [operatorFilter.rows]);

	//
	// D. Handle actions

	const handleOpenLineDetail = (line: typeof lines[number]) => {
		setSelectedLine(getFeedbackEntitySummary(line, 'line', linesById, getFeedbackLineContributionMeters(operatorFilter.rows, line)));
	};

	const handleCloseLineDetail = () => {
		setSelectedLine(undefined);
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
			<ContainerWrapper className={styles.container} padding="0">
				<div className={styles.header}>
					<h2 className={styles.title}>Todas as linhas</h2>

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
					{isLoading && <p className={styles.text}>A carregar linhas...</p>}
					{error && <p className={styles.text}>Erro ao carregar linhas.</p>}
					{!isLoading && !error && lines.length === 0 && <p className={styles.text}>Sem linhas para mostrar.</p>}

					{!isLoading && !error && lines.length > 0 && (
						<div className={styles.tableWrapper}>
							<Table highlightOnHover striped>
								<Table.Thead>
									<Table.Tr>
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

			<FeedbackEntityDetailModal item={selectedLine} onClose={handleCloseLineDetail} />
		</>
	);
}
