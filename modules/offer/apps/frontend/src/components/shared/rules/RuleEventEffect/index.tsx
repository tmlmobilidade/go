'use client';

import { RuleLabelTag } from '@/components/shared/rules/RuleLabelTag';
import { type EventReplacementRule, type EventRestrictionRule, type EventRule } from '@tmlmobilidade/go-types-offer';
import { Text } from '@tmlmobilidade/ui';
import { Trans, useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RuleEventEffectProps {
	conditions: string
	inline?: boolean
	rule: EventReplacementRule | EventRestrictionRule | EventRule
}

/* * */

/** Shared event effect for rule lists and single-day calendar previews. */
export function RuleEventEffect({ conditions, inline = false, rule }: RuleEventEffectProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div className={styles.root} data-inline={inline || undefined}>
			{rule.kind === 'event_replacement' ? (
				<>
					<Text>{t('default:shared.RuleEventEffect.replacement')}</Text>
					<RuleLabelTag label={conditions} tooltip={false} />
				</>
			) : rule.all_day ? (
				<Text>{t('default:shared.RuleEventEffect.restriction_all_day')}</Text>
			) : (
				<Trans
					components={{ timeRange: <RuleLabelTag label={conditions} tooltip={false} /> }}
					i18nKey={rule.timepoints?.length ? 'default:shared.RuleEventEffect.restriction_timepoints' : 'default:shared.RuleEventEffect.restriction_window'}
					t={t}
				/>
			)}
		</div>
	);
}
