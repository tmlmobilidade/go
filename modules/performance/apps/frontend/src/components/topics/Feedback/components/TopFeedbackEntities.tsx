/* * */

import type { FeedbackEntitySummary } from '@/utils/metrics/feedback-metrics';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackEntityDetailModal, FeedbackMetricTag } from '@/components/visualizations/Feedback';
import { FeedbackEntityDetailModalContextProvider, useFeedbackEntityDetailModalContext } from '@/contexts/feedback/FeedbackEntityDetailModal.context';
import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '@/utils/metrics/feedback-metrics';
import { AgencyTag, Table, Text } from '@tmlmobilidade/ui';
import { type KeyboardEvent, useMemo } from 'react';

import styles from '../styles.module.css';

/* * */

interface TopFeedbackEntitiesProps {
	items: FeedbackEntitySummary[]
	nameColumnLabel: string
	title: string
}

/* * */

function TopFeedbackEntitiesContent({ items, nameColumnLabel, title }: TopFeedbackEntitiesProps) {
	//
	// A. Setup variables

	const modalContext = useFeedbackEntityDetailModalContext();
	const showOperatorColumn = useMemo(() => items.some(item => Boolean(item.operatorId)), [items]);

	//
	// B. Handle actions

	const handleOpenItem = (item: FeedbackEntitySummary) => {
		modalContext.actions.open(item);
	};

	const handleItemKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, item: FeedbackEntitySummary) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		handleOpenItem(item);
	};

	//
	// C. Render components

	return (
		<>
			<ContainerWrapper className={`${styles.feedbackCard} ${styles.feedbackListCard} ${showOperatorColumn ? styles.feedbackListCardWithOperator : ''}`} padding="0">
				<div className={styles.feedbackCardHeader}>
					<p className={styles.cardTitle}>{title}</p>
				</div>

				<div className={styles.feedbackCardContent}>
					<div className={`${styles.feedbackTableWrapper} ${showOperatorColumn ? styles.feedbackTableWrapperWithOperator : ''}`}>
						<Table highlightOnHover striped>
							<Table.Thead>
								<Table.Tr>
									{showOperatorColumn && <Table.Th>Operador</Table.Th>}
									<Table.Th>{nameColumnLabel}</Table.Th>
									<Table.Th>Feedbacks</Table.Th>
									<Table.Th>Satisfação</Table.Th>
								</Table.Tr>
							</Table.Thead>

							<Table.Tbody>
								{items.map(item => (
									<Table.Tr
										key={item.id}
										aria-label={`Abrir detalhe de ${item.label}`}
										className={styles.feedbackTableRowButton}
										onClick={() => handleOpenItem(item)}
										onKeyDown={event => handleItemKeyDown(event, item)}
										role="button"
										tabIndex={0}
									>
										{showOperatorColumn && (
											<Table.Td>
												{item.operatorId && (
													<div className={styles.feedbackTableOperator}>
														<AgencyTag agencyId={item.operatorId} showShortName />
													</div>
												)}
											</Table.Td>
										)}

										<Table.Td>
											<div className={styles.feedbackEntityDetails}>
												<Text>{item.label}</Text>
											</div>
										</Table.Td>
										<Table.Td>
											<FeedbackMetricTag label={item.count.toLocaleString('pt-PT')} />
										</Table.Td>
										<Table.Td>
											<FeedbackMetricTag label={formatSatisfactionIndex(item.satisfactionIndex)} status={getFeedbackSatisfactionStatus(item.satisfactionIndex)} />
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</div>

				</div>
			</ContainerWrapper>

			<FeedbackEntityDetailModal />
		</>
	);
}

export function TopFeedbackEntities(props: TopFeedbackEntitiesProps) {
	return (
		<FeedbackEntityDetailModalContextProvider>
			<TopFeedbackEntitiesContent {...props} />
		</FeedbackEntityDetailModalContextProvider>
	);
}
