/* * */

'use client';

/* * */

import type { FeedbackEntitySummary } from '../../utils/feedback-entities';

import { CloseButton, Divider, Label, Modal, Pane, Section, Toolbar } from '@tmlmobilidade/ui';

import styles from '../../styles.module.css';

import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '../../utils/feedback-metrics';
import { FeedbackMetricTag } from '../FeedbackMetricTag';
import { LineContributionBreakdown } from '../LineContributionBreakdown';
import { OperatorLogo } from '../OperatorLogo (cosmetic feature)';

/* * */

interface FeedbackEntityDetailModalProps {
	item?: FeedbackEntitySummary
	onClose: () => void
}

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
				<div className={styles.feedbackEntityModalOperatorLogo}>
					<OperatorLogo height={48} operatorId={item.operatorId} width={72} />
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

export function FeedbackEntityDetailModal({ item, onClose }: FeedbackEntityDetailModalProps) {
	//
	// A. Render components

	return (
		<Modal onClose={onClose} opened={Boolean(item)} padding={0} size="xl" withCloseButton={false} centered>
			{item && (
				<Pane
					header={[
						<FeedbackEntityModalHeader key="feedback-entity-detail-toolbar" item={item} onClose={onClose} />,
					]}
				>
					{item.lineContributionMeters && (
						<>
							<LineContributionBreakdown entityId={item.id} meters={item.lineContributionMeters} />
							<Divider />
						</>
					)}

					<FeedbackEntityModalMetrics item={item} />
				</Pane>
			)}
		</Modal>
	);
}
