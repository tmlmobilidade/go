'use client';

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/events/rules/RuleCreate.modal';
import { RuleEventEffect } from '@/components/shared/rules/RuleEventEffect';
import { usePeriodsData } from '@/components/year-periods/shared/use-periods-data';
import { IconCalendarCancel, IconCalendarRepeat } from '@tabler/icons-react';
import { buildRuleSummary } from '@tmlmobilidade/go-utils-offer';
import { CloseButton, DeleteButton, Spacer, Toolbar, useLocaleContext, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RuleCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: { locale } } = useLocaleContext();
	const { data: periods } = usePeriodsData();
	const ruleCreateContext = useRuleCreateContext();
	const rule = useStandardFormWatch({ compute: values => values, control: ruleCreateContext.form.control });
	const isRestriction = rule.kind === 'event_restriction';

	//
	// B. Transform data

	const eventPeriods = useMemo(() => {
		const agencyIds = ruleCreateContext.eventData.agency_ids;
		return periods.filter(period => period.agency_ids.some(id => agencyIds.includes(id)));
	}, [periods, ruleCreateContext.eventData.agency_ids]);

	const summary = useMemo(() => buildRuleSummary(rule, {
		locale,
		periods: eventPeriods,
		t,
	}), [eventPeriods, locale, rule, t]);

	const showEffect = rule.kind === 'event_replacement' || (rule.kind === 'event_restriction' && (rule.all_day || summary.conditions.length > 0));

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateRuleModal} type="close" />
			<div className={styles.summary}>
				{isRestriction
					? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
					: <IconCalendarRepeat color="var(--color-primary)" size={20} />}
				{showEffect && <RuleEventEffect conditions={summary.conditions} rule={rule} inline />}
			</div>

			<Spacer />

			{ruleCreateContext.isEditing && ruleCreateContext.actions.delete && (
				<DeleteButton onDelete={ruleCreateContext.actions.delete} />
			)}

		</Toolbar>
	);

	//
}
