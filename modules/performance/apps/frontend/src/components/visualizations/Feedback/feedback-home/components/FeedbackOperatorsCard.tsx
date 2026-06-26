/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { type Agency } from '@tmlmobilidade/types';
import Image from 'next/image';

import styles from '../../styles.module.css';

import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '../../feedback-metrics';
import { FeedbackMetricTag } from '../../FeedbackMetricTag';
import { getOperatorLogoSrc } from '../utils/operator-logo';
import { getOperatorName } from '../utils/operators';

/* * */

export function FeedbackOperatorsCard({ operatorApprovalIndexes, operators }: { operatorApprovalIndexes: Map<string, number>, operators: Agency[] }) {
	//
	// A. Render components

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
								<th className={styles.operatorsTableMetricHeader} scope="col">ID</th>
								{operators.map(operator => (
									<th key={operator._id} scope="col">{operator._id}</th>
								))}
							</tr>
						</thead>

						<tbody>
							<tr>
								<th className={styles.operatorMetricLabel} scope="row">Operador</th>
								{operators.map((operator) => {
									const operatorLogoSrc = getOperatorLogoSrc(operator._id);

									return (
										<td key={operator._id}>
											<div className={styles.operatorIdentity}>
												{operatorLogoSrc && (
													<Image
														alt=""
														className={styles.operatorLogo}
														height={32}
														src={operatorLogoSrc}
														width={48}
													/>
												)}
												<span className={styles.operatorName}>{getOperatorName(operator)}</span>
											</div>
										</td>
									);
								})}
							</tr>

							<tr>
								<th className={styles.operatorMetricLabel} scope="row">Índice de aprovação</th>
								{operators.map((operator) => {
									const satisfactionIndex = operatorApprovalIndexes.get(operator._id);
									if (satisfactionIndex === undefined) return null;

									return (
										<td key={operator._id}>
											<div className={styles.operatorMetricValue}>
												<FeedbackMetricTag label={formatSatisfactionIndex(satisfactionIndex)} status={getFeedbackSatisfactionStatus(satisfactionIndex)} />
											</div>
										</td>
									);
								})}
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</ContainerWrapper>
	);
}
