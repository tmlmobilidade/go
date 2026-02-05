'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { TimeChip } from '@/components/patterns/rules/common/TimeChip';
import { BUSINESS_PERIODS, groupTimesByPeriod } from '@/utils/businessPeriods';
import { IconArrowRight, IconCalendarCancel, IconCalendarCheck } from '@tabler/icons-react';
import { ManualScheduleRule, ScheduleRule } from '@tmlmobilidade/types';
import { IconButton, Section, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface RulesListViewCardProps {
	rule: ScheduleRule
}

/* * */

export default function RulesListViewCard({ rule }: RulesListViewCardProps) {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	const isOffTime = rule?.operatingMode === 'exclude';
	const times = rule?.timePoints ?? [];
	const name = rule?.name || 'Regra sem nome';
	const groupedTimes = groupTimesByPeriod(times);

	//
	// B. Handle actions

	const handleEdit = () => {
		patternDetailContext.actions.openRuleModal(rule as ManualScheduleRule);
	};

	//
	// C. Render components

	return (
		<div className={styles.container} onClick={handleEdit}>
			<Section gap="md" justifyContent="space-between" padding="none">

				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					{isOffTime
						? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
						: <IconCalendarCheck color="var(--color-status-success-primary)" size={20} />}
					<Text size="lg">{name} · </Text>
					<Text className={styles.timesCount}>{times.length} {times.length > 1 ? 'horários' : 'horário'}</Text>
				</Section>

				<Section gap="xs" padding="none">
					{BUSINESS_PERIODS.filter(p => groupedTimes[p.key].length > 0).map(period => (
						<Section key={period.key} alignItems="center" flexDirection="row" gap="xs" padding="none">
							<Text size="xs" style={{ alignItems: 'center', display: 'flex', gap: '4px', minWidth: '50px' }}>
								{period.icon} {period.key.toUpperCase()}
							</Text>
							<Section flexDirection="row" flexWrap="wrap" gap="sm" padding="none">
								{groupedTimes[period.key].map(time => (
									<TimeChip key={time} time={time} />
								))}
							</Section>
						</Section>
					))}
				</Section>
			</Section>

			<IconButton
				icon={<IconArrowRight size={20} />}
				onClick={handleEdit}
			/>

		</div>
	);
}
