'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { IconArrowRight, IconCalendarCancel, IconCalendarCheck } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { ManualRule, ScheduleRule } from '@tmlmobilidade/types';
import { DayPeriodsTimepoints, IconButton, Section, Tag, Text, Tooltip } from '@tmlmobilidade/ui';
import Link from 'next/link';

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

	const isOffTime = rule.kind === 'manual' && rule.operating_mode === 'exclude';
	const isEventRule = rule.kind === 'manual' && rule.event_id !== undefined;
	const times = rule?.timepoints ?? [];
	const name = rule?.name || 'Regra sem nome';

	//
	// B. Handle actions

	const handleEdit = () => {
		patternDetailContext.actions.openRuleModal(rule as ManualRule);
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

					{isEventRule && (
						<Tag label="Evento" variant="muted" />
					)}

					{isEventRule ? (
						<Tooltip label="Ir para detalhes do evento" position="bottom" withArrow>
							<Link
								className={styles.eventName}
								href={PAGE_ROUTES.dates.EVENTS_DETAIL(rule.event_id)}
								onClick={event => event.stopPropagation()}
								rel="noopener noreferrer"
								target="_blank"
							>
								<Text size="lg">{name}</Text>
							</Link>
						</Tooltip>
					) : (
						<Text size="lg">{name}</Text>
					)}

					<Text>·</Text>

					<Text className={styles.timesCount}>{times.length} {times.length > 1 ? 'horários' : 'horário'}</Text>
				</Section>

				<DayPeriodsTimepoints timepoints={times} variant="compact" />
			</Section>

			<IconButton
				icon={<IconArrowRight size={20} />}
				onClick={handleEdit}
			/>

		</div>
	);
}
