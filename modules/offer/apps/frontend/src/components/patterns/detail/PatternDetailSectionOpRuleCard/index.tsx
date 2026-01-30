'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { IconArrowRight, IconCalendarCancel, IconCalendarCheck, IconEye } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates, Formats } from '@tmlmobilidade/dates';
import { EventDerivedRestriction, ManualScheduleRule, ScheduleRule } from '@tmlmobilidade/types';
import { IconButton, Section, Text } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

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
	const router = useRouter();

	const isOffTime = rule?.operatingMode === 'exclude';
	const times = rule?.timePoints ?? [];
	const name = rule?.name || 'Regra sem nome';

	const isEventDerived = rule?.kind === 'event';
	const event = isEventDerived ? (rule as EventDerivedRestriction) : null;
	const eventDates
		= event?.dates?.map(d =>
			Dates.fromOperationalDate(d, 'Europe/Lisbon')
				.toLocaleString(Formats.DATE_SHORT, 'pt-PT'),
		).join(', ') ?? '';

	const eventDatesSuffix
		= event && eventDates
			? (event.dates.length > 1 ? `(nos dias ${eventDates})` : `(no dia ${eventDates})`)
			: '';

	//
	// B. Handle actions

	const handleEdit = () => {
		patternDetailContext.actions.openRuleModal(rule as ManualScheduleRule);
	};

	const handleClickEventRule = () => {
		router.push(PAGE_ROUTES.dates.EVENTS_DETAIL(event?.event.id ?? ''));
	};

	//
	// C. Render components

	return (
		<div className={`${styles.container} ${isEventDerived ? styles.inferredEventRule : ''}`} onClick={!isEventDerived ? handleEdit : undefined}>
			<Section alignItems="center" flexDirection="row" gap="md" justifyContent="space-between" padding="none">

				{isOffTime
					? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
					: <IconCalendarCheck color="var(--color-status-success-primary)" size={20} />}

				<Section gap="xs" padding="none">
					<Text size="lg">{name}</Text>
					{!isEventDerived
						? <Text size="sm">{times.join(', ')}</Text>
						: <Text size="sm">{eventDates ? `${event.event.start_time} às ${event.event.end_time} ${eventDatesSuffix}` : ''}</Text>}
				</Section>

			</Section>

			{!isEventDerived && (
				<IconButton
					icon={<IconArrowRight size={20} />}
					onClick={handleEdit}
				/>
			)}

			{isEventDerived && (
				<IconButton
					icon={<IconEye size={20} />}
					onClick={handleClickEventRule}
					tooltip="Ir para detalhes do evento"
				/>
			)}
		</div>
	);
}
