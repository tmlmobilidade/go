import { IconClock } from '@tabler/icons-react';
import { Section, Surface, Tag, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface RulePreviewSummaryProps {
	summary: string
	timepointCount: number
}

/* * */

export function RulePreviewSummary({ summary, timepointCount }: RulePreviewSummaryProps) {
	//

	//
	// A. Setup variables

	const timepointLabel = `${timepointCount} ${timepointCount === 1 ? 'horário' : 'horários'}`;

	//
	// B. Render components

	return (
		<Surface className={styles.root}>
			<Section>
				<div className={styles.summaryHeader}>
					<Section gap="xs" padding="none">
						<Text c="dimmed" size="xs" weight="extra-bold">RESUMO DA REGRA</Text>
						<Text size="lg" weight="semibold">{summary}</Text>
					</Section>
					<Tag icon={<IconClock size={16} />} label={timepointLabel} variant="muted" />
				</div>
			</Section>
		</Surface>
	);

	//
}
