'use client';

/* * */

import { usePeriodsContext } from '@/contexts/Periods.context';
import { IconCalendarCancel, IconCalendarRepeat, IconEye } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates, FORMATS } from '@tmlmobilidade/dates';
import { EventReplacementRule, EventRestrictionRule, WEEKDAY_OPTIONS } from '@tmlmobilidade/types';
import { IconButton, Section, Text } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

interface RulesListViewEventCardProps {
	rule: EventReplacementRule | EventRestrictionRule
}

/* * */

export default function RulesListViewEventCard({ rule }: RulesListViewEventCardProps) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const periodsContext = usePeriodsContext();

	const isRestriction = rule.kind === 'event_restriction';
	const isReplacement = rule.kind === 'event_replacement';
	const name = rule?.name || 'Regra sem nome';

	const eventDates
		= rule?.dates?.map(d =>
			Dates.fromOperationalDate(d, 'Europe/Lisbon')
				.toLocaleString(FORMATS.DATE_SHORT, 'pt-PT'),
		).join(', ') ?? '';

	const eventDatesSuffix
		= rule && eventDates
			? (rule.dates.length > 1 ? `(nos dias ${eventDates})` : `(no dia ${eventDates})`)
			: '';

	// For replacement rules, build description of what they replace with
	let replacementDescription = '';
	if (isReplacement && rule.kind === 'event_replacement') {
		const weekdayLabels = rule.weekdays?.map(wd =>
			WEEKDAY_OPTIONS.find(opt => opt.value === wd)?.label,
		).filter(Boolean).join(', ') ?? '';

		const periodNames = rule.year_period_ids?.map((yearPeriodId) => {
			const period = periodsContext.data.raw.find(p => p._id === yearPeriodId);
			return period?.name || yearPeriodId;
		}).join(', ') || '';

		const parts: string[] = [];
		if (weekdayLabels) parts.push(weekdayLabels);
		if (periodNames) parts.push(periodNames);
		replacementDescription = parts.join(' · ');
	}

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
					{isRestriction && (
						<IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
					)}
					{isReplacement && (
						<IconCalendarRepeat color="var(--color-primary)" size={20} />
					)}
					<Text size="lg">{name} ·</Text>
					{(isRestriction || isReplacement) && (
						<Text className={styles.timesCount}>
							{rule.dates.length} {rule.dates.length > 1 ? 'dias' : 'dia'}
						</Text>
					)}
				</Section>

				{/* Restriction event */}
				{rule.kind === 'event_restriction' && (
					<>
						<Text>
							Oferta será excluída {eventDates && !rule.all_day
								? `das ${rule.start_time} às ${rule.end_time}`
								: `todo o dia`}
						</Text>
						<Text size="sm" style={{ fontFamily: 'monospace' }}>
							{eventDatesSuffix}
						</Text>
					</>
				)}

				{/* Replacement event */}
				{isReplacement && (
					<>
						<Text>Funcionará como {replacementDescription}</Text>
						<Text size="sm" style={{ fontFamily: 'monospace' }}>
							{eventDatesSuffix}
						</Text>
					</>

				)}

			</Section>

			<IconButton
				icon={<IconEye size={20} />}
				onClick={handleClickEventRule}
				tooltip="Ir para detalhes do evento"
			/>
		</div>
	);
}
