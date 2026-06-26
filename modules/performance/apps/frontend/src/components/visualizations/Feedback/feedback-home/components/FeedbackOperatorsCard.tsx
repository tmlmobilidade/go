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
import { getOperatorName } from '../utils/operators';

/* * */

type OperatorSortMode = 'id' | 'satisfaction_asc' | 'satisfaction_desc';

const OPERATOR_SORT_OPTIONS: { label: string, value: OperatorSortMode }[] = [
	{ label: 'ID', value: 'id' },
	{ label: 'Maior índice', value: 'satisfaction_desc' },
	{ label: 'Menor índice', value: 'satisfaction_asc' },
];

const OPERATOR_ID_COLLATOR = new Intl.Collator('pt-PT', { numeric: true, sensitivity: 'base' });

/* * */

function compareOperatorsById(operatorA: Agency, operatorB: Agency) {
	return OPERATOR_ID_COLLATOR.compare(operatorA._id, operatorB._id);
}

function sortOperatorsBySatisfactionIndex(operators: Agency[], operatorApprovalIndexes: Map<string, number>, sortMode: OperatorSortMode) {
	if (sortMode === 'id') return [...operators].sort(compareOperatorsById);

	return [...operators].sort((operatorA, operatorB) => {
		const satisfactionIndexA = operatorApprovalIndexes.get(operatorA._id) ?? 0;
		const satisfactionIndexB = operatorApprovalIndexes.get(operatorB._id) ?? 0;
		const satisfactionDiff = satisfactionIndexA - satisfactionIndexB;

		if (satisfactionDiff === 0) return compareOperatorsById(operatorA, operatorB);
		if (sortMode === 'satisfaction_asc') return satisfactionDiff;
		return satisfactionDiff * -1;
	});
}

/* * */

export function FeedbackOperatorsCard({ operatorApprovalIndexes, operators }: { operatorApprovalIndexes: Map<string, number>, operators: Agency[] }) {
	//
	// A. Setup variables

	const [operatorSortMode, setOperatorSortMode] = useState<OperatorSortMode>('id');

	const sortedOperators = useMemo(() => {
		return sortOperatorsBySatisfactionIndex(operators, operatorApprovalIndexes, operatorSortMode);
	}, [operatorApprovalIndexes, operatorSortMode, operators]);

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
					<h3>Ordenar</h3>
					<SegmentedControl data={OPERATOR_SORT_OPTIONS} onChange={handleChangeOperatorSortMode} value={operatorSortMode} />
				</div>
			</div>

			<div className={styles.feedbackCardContent}>
				<div className={styles.operatorsTableWrapper}>
					<table className={styles.operatorsTable}>
						<thead>
							<tr>
								<th className={styles.operatorsTableMetricHeader} scope="col">ID</th>
								{sortedOperators.map(operator => (
									<th key={operator._id} scope="col">{operator._id}</th>
								))}
							</tr>
						</thead>

						<tbody>
							<tr>
								<th className={styles.operatorMetricLabel} scope="row">Operador</th>
								{sortedOperators.map((operator) => {
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
								{sortedOperators.map((operator) => {
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
