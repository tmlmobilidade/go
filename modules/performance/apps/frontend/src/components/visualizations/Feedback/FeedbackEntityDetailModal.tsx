/* * */

import type { FeedbackEntitySummary } from './feedback-entities';

import { CloseButton, Divider, Label, Modal, Pane, Section, Toolbar } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { FeedbackMetricTag } from './feedback-home/components/FeedbackMetricTag';
import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from './feedback-metrics';

/* * */

interface FeedbackEntityDetailModalProps {
	entityName: string
	item?: FeedbackEntitySummary
	onClose: () => void
}

/* * */

export function FeedbackEntityDetailModal({ entityName, item, onClose }: FeedbackEntityDetailModalProps) {
	//
	// A. Render components

	return (
		<Modal onClose={onClose} opened={Boolean(item)} padding={0} size="lg" withCloseButton={false} centered>
			{item && (
				<Pane
					header={[
						<Toolbar key="feedback-entity-detail-toolbar">
							<CloseButton onClick={onClose} type="close" />
							<div className={styles.feedbackEntityModalTitle}>
								<Label size="lg">{item.id}</Label>
								<Label size="md" variant="muted">{item.label}</Label>
							</div>
						</Toolbar>,
					]}
				>
					<Section gap="sm">
						<Label size="sm" caps>Tipo</Label>
						<Label size="md">{entityName}</Label>
					</Section>

					<Divider />

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
				</Pane>
			)}
		</Modal>
	);
}
