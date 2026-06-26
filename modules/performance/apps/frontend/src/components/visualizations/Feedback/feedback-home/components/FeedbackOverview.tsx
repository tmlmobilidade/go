/* * */

import { Routes } from '@/routes';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubLine, type HubStop, type PublicFeedback } from '@tmlmobilidade/types';
import { useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from '../../styles.module.css';

import { buildLineLabelsById, buildStopLabelsById } from '../../network-labels';
import { getFeedbackOverviewData } from '../utils/feedback-preview';
import { buildOperatorApprovalIndexes } from '../utils/operator-approval';
import { sortOperatorsByCode } from '../utils/operators';
import { FeedbackGraphCard } from './FeedbackGraphCard';
import { FeedbackOperatorsCard } from './FeedbackOperatorsCard';
import { TopFeedbackEntities } from './TopFeedbackEntities';

/* * */

interface FeedbackOverviewProps {
	rows: PublicFeedback[]
}

/* * */

export function FeedbackOverview({ rows }: FeedbackOverviewProps) {
	const { data: linesData } = useSWR<HubLine[], Error>({ credentials: 'omit', url: Routes.HUB_LINES });
	const { data: stopsData } = useSWR<HubStop[], Error>({ credentials: 'omit', url: Routes.HUB_STOPS });
	const { raw: operatorsData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST);

	const linesById = useMemo(() => buildLineLabelsById(linesData), [linesData]);
	const stopsById = useMemo(() => buildStopLabelsById(stopsData), [stopsData]);
	const feedbackData = useMemo(() => getFeedbackOverviewData(rows, linesById, stopsById), [linesById, rows, stopsById]);
	const operators = useMemo(() => sortOperatorsByCode(operatorsData), [operatorsData]);
	const operatorApprovalIndexes = useMemo(() => buildOperatorApprovalIndexes(rows, linesData), [linesData, rows]);

	return (
		<>
			<FeedbackGraphCard rows={rows} />

			<section className={styles.listsGrid}>
				<TopFeedbackEntities items={feedbackData.topLines} nameColumnLabel="Linha" title="Linhas com mais feedbacks" />
				<TopFeedbackEntities items={feedbackData.topStops} nameColumnLabel="Paragem" title="Paragens com mais feedbacks" />
			</section>

			<FeedbackOperatorsCard operatorApprovalIndexes={operatorApprovalIndexes} operators={operators} />
		</>
	);
}
