'use client';

/* * */

import { IconCalendarCancel, IconCalendarCheck, IconEye } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates, Formats } from '@tmlmobilidade/dates';
import { EventDerivedRestriction } from '@tmlmobilidade/types';
import { IconButton, Section, Text } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

interface RulesListViewEventCardProps {
	rule: EventDerivedRestriction
}

/* * */

export default function RulesListViewEventCard({ rule }: RulesListViewEventCardProps) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const isOffTime = rule?.operatingMode === 'exclude';
	const times = rule?.timePoints ?? [];
	const name = rule?.name || 'Regra sem nome';

	const eventDates
		= rule?.dates?.map(d =>
			Dates.fromOperationalDate(d, 'Europe/Lisbon')
				.toLocaleString(Formats.DATE_SHORT, 'pt-PT'),
		).join(', ') ?? '';

	const eventDatesSuffix
		= rule && eventDates
			? (rule.dates.length > 1 ? `(nos dias ${eventDates})` : `(no dia ${eventDates})`)
			: '';

	//
	// B. Handle actions

	const handleClickEventRule = () => {
		router.push(PAGE_ROUTES.dates.EVENTS_DETAIL(rule?.event.id ?? ''));
	};

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<Section gap="md" justifyContent="space-between" padding="none">

				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					{isOffTime
						? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
						: <IconCalendarCheck color="var(--color-status-success-primary)" size={20} />}
					<Text size="lg">{name} · </Text>
					<Text className={styles.timesCount}>{times.length} {times.length > 1 ? 'horários' : 'horário'}</Text>
				</Section>

				{/* TODO: implement date ranges */}
				<Text size="sm" style={{ fontFamily: 'monospace' }}>{eventDates && !rule.event.all_day ? `${rule.event.start_time} às ${rule.event.end_time} ${eventDatesSuffix}` : `Todo o dia ${eventDatesSuffix}`}</Text>

			</Section>

			<IconButton
				icon={<IconEye size={20} />}
				onClick={handleClickEventRule}
				tooltip="Ir para detalhes do evento"
			/>
		</div>
	);
}
