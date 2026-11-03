'use client';

import { IconClock } from '@tabler/icons-react';
import { Section, Surface, Tag, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

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

	const { t } = useTranslation();
	const timepointLabel = t('default:scheduling.copy.timepointCount', '', { count: timepointCount });

	//
	// B. Render components

	return (
		<Surface className={styles.root}>
			<Section>
				<div className={styles.summaryHeader}>
					<Section gap="xs" padding="none">
						<Text c="dimmed" size="xs" weight="extra-bold">{t('default:scheduling.copy.ruleSummary')}</Text>
						<Text size="lg" weight="semibold">{summary}</Text>
					</Section>
					<Tag icon={<IconClock size={16} />} label={timepointLabel} variant="muted" />
				</div>
			</Section>
		</Surface>
	);

	//
}
