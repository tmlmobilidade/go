'use client';

import { RuleEventEffect } from '@/components/shared/rules/RuleEventEffect';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { IconCalendar, IconCalendarCancel, IconCalendarRepeat, IconPencil } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { EventReplacementRule, EventRestrictionRule } from '@tmlmobilidade/go-types-offer';
import { buildRuleSummary, formatRuleDates } from '@tmlmobilidade/go-utils-offer';
import { IconButton, Text, useLocaleContext } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

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

	const { t } = useTranslation();
	const { data: { locale } } = useLocaleContext();
	const periodsContext = usePeriodsContext();

	const isRestriction = rule.kind === 'event_restriction';
	const name = rule.event.title || t('default:scheduling.copy.unnamedRule');
	const eventUrl = PAGE_ROUTES.offer.EVENTS_DETAIL(rule.event.id);

	const summary = buildRuleSummary(rule, { locale, periods: periodsContext.data.raw, t });

	//
	// B. Handle actions

	const handleClickEventRule = () => {
		window.open(eventUrl, '_blank', 'noopener,noreferrer');
	};

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.title}>
					{isRestriction
						? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
						: <IconCalendarRepeat color="var(--color-primary)" size={20} />}
					<Link className={styles.eventName} href={eventUrl} rel="noopener noreferrer" target="_blank">
						<Text weight="semibold">{name}</Text>
					</Link>
				</div>
				<IconButton
					icon={<IconPencil size={20} />}
					onClick={handleClickEventRule}
					tooltip={t('default:scheduling.copy.eventDetails')}
				/>
			</div>

			<div className={styles.content}>
				<RuleEventEffect conditions={summary.conditions} rule={rule} />
				<div className={styles.dates}>
					<IconCalendar size={16} />
					<Text c="var(--color-system-text-100)" size="sm">{formatRuleDates(rule.dates, locale)}</Text>
				</div>
			</div>
		</div>
	);
}
