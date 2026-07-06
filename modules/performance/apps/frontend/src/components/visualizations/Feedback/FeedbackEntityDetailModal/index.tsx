/* * */

'use client';

/* * */

import type { FeedbackEntitySummary } from '@/utils/metrics/feedback-metrics';

import { useFeedbackEntityDetailModalContext } from '@/contexts/feedback/FeedbackEntityDetailModal.context';
import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '@/utils/metrics/feedback-metrics';
import { AgencyTag, CloseButton, Divider, Label, Modal, Pane, Section, Toolbar } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

import { FeedbackMetricTag } from '../FeedbackMetricTag';
import { LineContributionBreakdown } from '../LineContributionBreakdown';
import { StopReasonBreakdown } from '../StopReasonBreakdown';

/* * */

function FeedbackEntityModalHeader({ item, onClose }: { item: FeedbackEntitySummary, onClose: () => void }) {
	return (
		<Toolbar>
			<CloseButton onClick={onClose} type="close" />
			<div className={styles.feedbackEntityModalTitle}>
				<Label size="sm" variant="muted">{item.id}</Label>
				<Label size="lg">{item.label}</Label>
			</div>
			{item.operatorId && (
				<div className={styles.feedbackEntityModalOperator}>
					<AgencyTag agencyId={item.operatorId} showShortName />
				</div>
			)}
		</Toolbar>
	);
}

function FeedbackEntityModalMetrics({ item }: { item: FeedbackEntitySummary }) {
	return (
		<Section gap="sm">
			<Label size="sm" caps>Resumo</Label>
			<div className={styles.feedbackEntityModalMetrics}>
				<div className={styles.feedbackEntityModalMetric}>
					<span className={styles.feedbackEntityModalMetricLabel}>Feedbacks</span>
					<FeedbackMetricTag label={item.count.toLocaleString('pt-PT')} />
				</div>

				<div className={styles.feedbackEntityModalMetric}>
					<span className={styles.feedbackEntityModalMetricLabel}>Satisfação</span>
					<FeedbackMetricTag label={formatSatisfactionIndex(item.satisfactionIndex)} status={getFeedbackSatisfactionStatus(item.satisfactionIndex)} />
				</div>
			</div>
		</Section>
	);
}

/* * */

export function FeedbackEntityDetailModal() {
	//
	// A. Setup variables

	const modalContext = useFeedbackEntityDetailModalContext();
	const item = modalContext.data.item;

	//
	// B. Render components

	return (
		<Modal onClose={modalContext.actions.close} opened={Boolean(item)} padding={0} size="xl" withCloseButton={false} centered>
			{item && (
				<Pane
					header={[
						<FeedbackEntityModalHeader key="feedback-entity-detail-toolbar" item={item} onClose={modalContext.actions.close} />,
					]}
				>
					{item.lineContributionMeters && (
						<>
							<LineContributionBreakdown entityId={item.id} meters={item.lineContributionMeters} />
							<Divider />
						</>
					)}

					{item.stopReasonMeters && (
						<>
							<StopReasonBreakdown entityId={item.id} meters={item.stopReasonMeters} />
							<Divider />
						</>
					)}

					<FeedbackEntityModalMetrics item={item} />
				</Pane>
			)}
		</Modal>
	);
}
