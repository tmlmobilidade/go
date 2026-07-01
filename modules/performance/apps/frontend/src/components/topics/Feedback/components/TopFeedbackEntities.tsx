/* * */

import type { FeedbackEntitySummary } from '@/utils/feedback/feedback-entities';
import type { FeedbackReasonChartSlice } from '@/utils/feedback/feedback-reasons';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackEntityDetailModal, FeedbackMetricTag } from '@/components/visualizations/Feedback';
import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '@/utils/feedback/feedback-metrics';
import { PieChart, Table, Text } from '@tmlmobilidade/ui';
import { type KeyboardEvent, useState } from 'react';

import styles from '../styles.module.css';

/* * */

interface TopFeedbackEntitiesProps {
	items: FeedbackEntitySummary[]
	nameColumnLabel: string
	reasonChartData: FeedbackReasonChartSlice[]
	title: string
}

/* * */

export function TopFeedbackEntities({ items, nameColumnLabel, reasonChartData, title }: TopFeedbackEntitiesProps) {
	//
	// A. Setup variables

	const [selectedItem, setSelectedItem] = useState<FeedbackEntitySummary>();

	//
	// B. Handle actions

	const handleOpenItem = (item: FeedbackEntitySummary) => {
		setSelectedItem(item);
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
			<ContainerWrapper className={styles.feedbackCard} padding="0">
				<div className={styles.feedbackCardHeader}>
					<p className={styles.cardTitle}>{title}</p>
				</div>

				<div className={styles.feedbackCardContent}>
					<div className={styles.feedbackTableWrapper}>
						<Table highlightOnHover striped>
							<Table.Thead>
								<Table.Tr>
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
										<Table.Td>
											<div className={styles.feedbackEntityDetails}>
												<Text>{item.label}</Text>
												{item.description && <Text c="dimmed" size="sm">{item.description}</Text>}
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

					{reasonChartData.length > 0 && (
						<div className={styles.feedbackReasonChart}>
							<PieChart
								data={reasonChartData}
								labelsPosition="outside"
								labelsType="percent"
								size={200}
								tooltipDataSource="segment"
								valueFormatter={value => value.toLocaleString('pt-PT')}
								withLabels
								withLabelsLine
								withTooltip
							/>
						</div>
					)}
				</div>
			</ContainerWrapper>

			<FeedbackEntityDetailModal item={selectedItem} onClose={() => setSelectedItem(undefined)} />
		</>
	);
}
