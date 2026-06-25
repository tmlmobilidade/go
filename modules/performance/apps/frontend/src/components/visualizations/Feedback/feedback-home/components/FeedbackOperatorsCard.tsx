/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { type Agency } from '@tmlmobilidade/types';

import styles from '../../styles.module.css';

import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '../../feedback-metrics';
import { FeedbackMetricTag } from '../../FeedbackMetricTag';
import { getOperatorCode, getOperatorName } from '../utils/operators';

/* * */

interface FeedbackOperatorsCardProps {
	operatorApprovalIndexes: Map<string, number>
	operators: Agency[]
}

/* * */

function ApprovalMetricCell({ operatorApprovalIndexes, operatorId }: { operatorApprovalIndexes: Map<string, number>, operatorId: string }) {
	const satisfactionIndex = operatorApprovalIndexes.get(operatorId);

	return (
		<td>
			<div className={styles.operatorMetricValue}>
				<FeedbackMetricTag label={satisfactionIndex === undefined ? '-' : formatSatisfactionIndex(satisfactionIndex)} status={getFeedbackSatisfactionStatus(satisfactionIndex)} />
			</div>
		</td>
	);
}

/* * */

export function FeedbackOperatorsCard({ operatorApprovalIndexes, operators }: FeedbackOperatorsCardProps) {
	return (
		<ContainerWrapper className={styles.feedbackCard} padding="0">
			<div className={styles.feedbackCardHeader}>
				<p className={styles.cardTitle}>Operadores</p>
			</div>

			<div className={styles.feedbackCardContent}>
				<div className={styles.operatorsTableWrapper}>
					<table className={styles.operatorsTable}>
						<thead>
							<tr>
								<th className={styles.operatorsTableMetricHeader} scope="col">Métrica</th>
								{operators.map(operator => (
									<th key={operator._id} scope="col">{getOperatorCode(operator)}</th>
								))}
							</tr>
						</thead>

						<tbody>
							<tr>
								<th className={styles.operatorMetricLabel} scope="row">Operador</th>
								{operators.map(operator => (
									<td key={operator._id}>
										<span className={styles.operatorName}>{getOperatorName(operator)}</span>
									</td>
								))}
							</tr>

							<tr>
								<th className={styles.operatorMetricLabel} scope="row">Índice de aprovação</th>
								{operators.map(operator => (
									<ApprovalMetricCell key={operator._id} operatorApprovalIndexes={operatorApprovalIndexes} operatorId={operator._id} />
								))}
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</ContainerWrapper>
	);
}
