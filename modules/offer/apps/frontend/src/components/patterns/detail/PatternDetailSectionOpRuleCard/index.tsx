'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { IconArrowRight, IconCalendarCancel, IconCalendarCheck } from '@tabler/icons-react';
import { ScheduleRule } from '@tmlmobilidade/types';
import { IconButton, Section, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface PatternDetailSectionOpRuleCardProps {
	rule: ScheduleRule
}

/* * */

export default function PatternDetailSectionOpRuleCard({ rule }: PatternDetailSectionOpRuleCardProps) {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	const isOffTime = rule.operatingMode === 'exclude';
	const name = rule.name || 'Regra sem nome';
	const times = rule.timePoints || [];

	//
	// B. Handle actions

	const handleEdit = () => {
		patternDetailContext.actions.openRuleModal(rule);
	};

	//
	// C. Render components

	return (
		<div className={styles.container} onClick={handleEdit}>
			<Section alignItems="center" flexDirection="row" gap="md" justifyContent="space-between" padding="none">

				{isOffTime
					? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
					: <IconCalendarCheck color="var(--color-status-success-primary)" size={20} />}

				<Section gap="xs" padding="none">
					<Text size="lg">{name}</Text>
					<Text size="sm">{times.join(', ')}</Text>
				</Section>

			</Section>

			<IconButton
				icon={<IconArrowRight size={20} />}
				onClick={handleEdit}
			/>
		</div>
	);
}
