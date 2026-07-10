/* * */

import { FeedbackMetricTag } from '@/components/visualizations/Feedback';
import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '@/utils/metrics/feedback-metrics';
import { AgencyTag, Table, Text } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { type KeyboardEvent } from 'react';

import styles from './styles.module.css';

/* * */

interface FeedbackEntitiesTableItem {
	entityId: string
	feedbackCount: number
	operatorId?: string
	satisfactionIndex: number
}

interface FeedbackEntitiesTableProps<T extends FeedbackEntitiesTableItem> {
	entityColumnLabel: string
	getEntityLabel: (entityId: string) => string
	items: T[]
	onOpenEntity: (item: T) => void
	openEntityAriaLabel: (entityLabel: string) => string
	showOperatorColumn?: boolean
}

/* * */

function OperatorCell({ operatorId }: { operatorId?: string }) {
	if (!operatorId) return <Text>-</Text>;

	return (
		<div className={styles.operatorCell}>
			<AgencyTag agencyId={operatorId} showShortName />
		</div>
	);
}

/* * */

export function FeedbackEntitiesTable<T extends FeedbackEntitiesTableItem>({
	entityColumnLabel,
	getEntityLabel,
	items,
	onOpenEntity,
	openEntityAriaLabel,
	showOperatorColumn = false,
}: FeedbackEntitiesTableProps<T>) {
	const t = useTranslations();

	const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, item: T) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		onOpenEntity(item);
	};

	return (
		<div className={`${styles.tableWrapper} ${showOperatorColumn ? styles.tableWrapperWithOperator : ''}`}>
			<Table highlightOnHover striped>
				<Table.Thead>
					<Table.Tr>
						{showOperatorColumn && <Table.Th>{t('feedback.labels.operator')}</Table.Th>}
						<Table.Th>{entityColumnLabel}</Table.Th>
						<Table.Th>{t('feedback.labels.feedbacks')}</Table.Th>
						<Table.Th>{t('feedback.labels.satisfaction_index')}</Table.Th>
					</Table.Tr>
				</Table.Thead>

				<Table.Tbody>
					{items.map((item) => {
						const entityLabel = getEntityLabel(item.entityId);

						return (
							<Table.Tr
								key={item.entityId}
								aria-label={openEntityAriaLabel(entityLabel)}
								className={styles.tableRowButton}
								onClick={() => onOpenEntity(item)}
								onKeyDown={event => handleKeyDown(event, item)}
								role="button"
								tabIndex={0}
							>
								{showOperatorColumn && (
									<Table.Td>
										<OperatorCell operatorId={item.operatorId} />
									</Table.Td>
								)}
								<Table.Td>
									<Text>{entityLabel}</Text>
								</Table.Td>
								<Table.Td>
									<FeedbackMetricTag label={item.feedbackCount.toLocaleString('pt-PT')} />
								</Table.Td>
								<Table.Td>
									<FeedbackMetricTag label={formatSatisfactionIndex(item.satisfactionIndex)} status={getFeedbackSatisfactionStatus(item.satisfactionIndex)} />
								</Table.Td>
							</Table.Tr>
						);
					})}
				</Table.Tbody>
			</Table>
		</div>
	);
}
