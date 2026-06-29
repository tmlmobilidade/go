/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { type Agency } from '@tmlmobilidade/types';
import { SegmentedControl } from '@tmlmobilidade/ui';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import styles from '../../styles.module.css';

import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '../../feedback-metrics';
import { FeedbackMetricTag } from '../../FeedbackMetricTag';
import { getOperatorLogoSrc } from '../utils/operator-logo';
import { compareOperatorsByCode, getOperatorName } from '../utils/operators';

/* * */

type OperatorSortMode = 'id' | 'satisfaction_asc' | 'satisfaction_desc';

interface FeedbackOperatorApproval {
	operator: Agency
	satisfactionIndex: number
}

interface FeedbackOperatorsCardProps {
	operatorApprovals: FeedbackOperatorApproval[]
}

const OPERATOR_SORT_OPTIONS: { label: string, value: OperatorSortMode }[] = [
	{ label: 'ID', value: 'id' },
	{ label: 'Maior índice', value: 'satisfaction_desc' },
	{ label: 'Menor índice', value: 'satisfaction_asc' },
];

/* * */

function sortOperatorApprovals(operatorApprovals: FeedbackOperatorApproval[], sortMode: OperatorSortMode) {
	if (sortMode === 'id') return [...operatorApprovals].sort((approvalA, approvalB) => compareOperatorsByCode(approvalA.operator, approvalB.operator));

	return [...operatorApprovals].sort((approvalA, approvalB) => {
		const satisfactionDiff = approvalA.satisfactionIndex - approvalB.satisfactionIndex;

		// Keep ID ordering as the tie-breaker so satisfaction sorts remain stable.
		if (satisfactionDiff === 0) return compareOperatorsByCode(approvalA.operator, approvalB.operator);
		if (sortMode === 'satisfaction_asc') return satisfactionDiff;
		return satisfactionDiff * -1;
	});
}

/* * */

export function FeedbackOperatorsCard({ operatorApprovals }: FeedbackOperatorsCardProps) {
	//
	// A. Setup variables

	const [operatorSortMode, setOperatorSortMode] = useState<OperatorSortMode>('id');

	const sortedOperatorApprovals = useMemo(() => {
		return sortOperatorApprovals(operatorApprovals, operatorSortMode);
	}, [operatorApprovals, operatorSortMode]);

	//
	// B. Handle actions

	const handleChangeOperatorSortMode = (value: OperatorSortMode) => {
		setOperatorSortMode(value);
	};

	//
	// C. Render components

	return (
		<ContainerWrapper className={styles.feedbackCard} padding="0">
			<div className={`${styles.feedbackCardHeader} ${styles.feedbackCardHeaderWithControls}`}>
				<p className={styles.cardTitle}>Operadores</p>

				<div className={styles.feedbackCardControl}>
					<h3 className={styles.feedbackCardControlLabel}>Ordenar</h3>
					<SegmentedControl data={OPERATOR_SORT_OPTIONS} onChange={handleChangeOperatorSortMode} value={operatorSortMode} />
				</div>
			</div>

			<div className={styles.feedbackCardContent}>
				<div className={styles.operatorsTableWrapper}>
					<table className={styles.operatorsTable}>
						<thead>
							<tr>
								<th className={styles.operatorsTableMetricHeader} scope="col">ID</th>
								{sortedOperatorApprovals.map(({ operator }) => (
									<th key={operator._id} scope="col">{operator._id}</th>
								))}
							</tr>
						</thead>

						<tbody>
							<tr>
								<th className={styles.operatorMetricLabel} scope="row">Operador</th>
								{sortedOperatorApprovals.map(({ operator }) => {
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
								{sortedOperatorApprovals.map(({ operator, satisfactionIndex }) => (
									<td key={operator._id}>
										<div className={styles.operatorMetricValue}>
											<FeedbackMetricTag label={formatSatisfactionIndex(satisfactionIndex)} status={getFeedbackSatisfactionStatus(satisfactionIndex)} />
										</div>
									</td>
								))}
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</ContainerWrapper>
	);
}
