'use client';

import { usePeriodsContext } from '@/contexts/Periods.context';
import { IconCalendarCancel, IconCalendarRepeat, IconEye } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { EventReplacementRule, EventRestrictionRule } from '@tmlmobilidade/go-types-offer';
import { buildRuleSummary } from '@tmlmobilidade/go-utils-offer';
import { IconButton, Section, Text, useLocaleContext } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
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
	const router = useRouter();
	const { data: { locale } } = useLocaleContext();
	const periodsContext = usePeriodsContext();

	const isRestriction = rule.kind === 'event_restriction';
	const isReplacement = rule.kind === 'event_replacement';
	const name = rule?.name || t('default:scheduling.copy.unnamedRule');

	const summary = buildRuleSummary(rule, { locale, periods: periodsContext.data.raw, t });

	//
	// B. Handle actions

	const handleClickEventRule = () => {
		router.push(PAGE_ROUTES.offer.EVENTS_DETAIL(rule?.event.id ?? ''));
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
							{t('default:scheduling.copy.dayCount', '', { count: rule.dates.length })}
						</Text>
					)}
				</Section>

				{/* Localized restriction/replacement details share the summary contract. */}
				<Text>{summary.tooltip}</Text>

			</Section>

			<IconButton
				icon={<IconEye size={20} />}
				onClick={handleClickEventRule}
				tooltip={t('default:scheduling.copy.eventDetails')}
			/>
		</div>
	);
}
