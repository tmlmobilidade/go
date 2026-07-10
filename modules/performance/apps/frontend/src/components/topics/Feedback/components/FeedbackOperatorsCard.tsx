/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackMetricTag } from '@/components/visualizations/Feedback';
import { compareOperatorsByCode } from '@/utils/feedback/operators';
import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '@/utils/metrics/feedback-metrics';
import { type Agency } from '@tmlmobilidade/types';
import { AgencyTag, SegmentedControl } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import styles from '../styles.module.css';

/* * */

type OperatorSortMode = 'id' | 'satisfaction_asc' | 'satisfaction_desc';

interface FeedbackOperatorApproval {
	operator: Agency
	satisfactionIndex: number
}

interface FeedbackOperatorsCardProps {
	operatorApprovals: FeedbackOperatorApproval[]
}

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

	const t = useTranslations();
	const [operatorSortMode, setOperatorSortMode] = useState<OperatorSortMode>('id');
	const operatorSortOptions = useMemo((): { label: string, value: OperatorSortMode }[] => [
		{ label: t('feedback.labels.id'), value: 'id' },
		{ label: t('feedback.sort.satisfaction_desc'), value: 'satisfaction_desc' },
		{ label: t('feedback.sort.satisfaction_asc'), value: 'satisfaction_asc' },
	], [t]);

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
				<p className={styles.cardTitle}>{t('feedback.operators.title')}</p>

				<div className={styles.feedbackCardControl}>
					<h3 className={styles.feedbackCardControlLabel}>{t('feedback.labels.sort')}</h3>
					<SegmentedControl data={operatorSortOptions} onChange={handleChangeOperatorSortMode} value={operatorSortMode} />
				</div>
			</div>

			<div className={styles.feedbackCardContent}>
				<div className={styles.operatorsTableWrapper}>
					<table className={styles.operatorsTable}>
						<thead>
							<tr>
								<th className={styles.operatorsTableMetricHeader} scope="col">{t('feedback.labels.id')}</th>
								{sortedOperatorApprovals.map(({ operator }) => (
									<th key={operator._id} scope="col">{operator._id}</th>
								))}
							</tr>
						</thead>

						<tbody>
							<tr>
								<th className={styles.operatorMetricLabel} scope="row">{t('feedback.labels.operator')}</th>
								{sortedOperatorApprovals.map(({ operator }) => (
									<td key={operator._id}>
										<div className={styles.operatorIdentity}>
											<AgencyTag agencyId={operator._id} showShortName />
										</div>
									</td>
								))}
							</tr>

							<tr>
								<th className={styles.operatorMetricLabel} scope="row">{t('feedback.labels.approval_index')}</th>
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
