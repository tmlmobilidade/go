'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import RulesListViewEventCard from '@/components/patterns/rules/list/RulesListViewEventCard';
import RulesListViewManualCard from '@/components/patterns/rules/list/RulesListViewManualCard';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { type EventReplacementRule } from '@tmlmobilidade/go-types-offer';
import { sortRulesBySection } from '@tmlmobilidade/go-utils-offer';
import { Section, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RulesListView() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const patternDetailContext = usePatternDetailContext();
	const periodsContext = usePeriodsContext();

	const mergedRules = patternDetailContext.data.mergedRules || [];
	const totalYearPeriods = periodsContext.data.raw?.length || 0;

	const includeRules = sortRulesBySection(
		mergedRules.filter(rule =>
			rule.kind === 'manual' && rule.operating_mode === 'include',
		),
		'include',
		totalYearPeriods,
	);

	const excludeRules = sortRulesBySection(
		mergedRules.filter(rule =>
			(rule.kind === 'manual' && rule.operating_mode === 'exclude')
			|| rule.kind === 'event_restriction',
		),
		'exclude',
		totalYearPeriods,
	);

	const overwriteRules = sortRulesBySection(
		mergedRules.filter(rule => rule.kind === 'event_replacement'),
		'overwrite',
		totalYearPeriods,
	);

	//
	// B. Render components

	return (
		<Section gap="lg" padding="none">
			{/* Include Rules Section */}
			<Section gap="md" padding="none">
				<Text size="xl" weight="bold">{t('default:scheduling.copy.includeService')}</Text>
				{includeRules.length > 0
					? includeRules.map((rule, index) => (
						<RulesListViewManualCard key={rule._id || index} rule={rule} />
					))
					: (
						<Text c="dimmed" className={styles.emptyMessage}>{t('default:scheduling.copy.noIncludeRules')}</Text>
					)}
			</Section>

			{/* Exclude Rules Section */}
			<Section gap="md" padding="none">
				<Text size="xl" weight="bold">{t('default:scheduling.copy.excludeService')}</Text>
				{excludeRules.length > 0
					? excludeRules.map((rule, index) => (
						rule.kind === 'event_restriction'
							? <RulesListViewEventCard key={rule._id || index} rule={rule} />
							: <RulesListViewManualCard key={rule._id || index} rule={rule} />
					))
					: (
						<Text c="dimmed" className={styles.emptyMessage}>{t('default:scheduling.copy.noExcludeRules')}</Text>
					)}
			</Section>

			{/* Overwrite Rules Section (Event Replacements) */}
			{overwriteRules.length > 0 && (
				<Section gap="md" padding="none">
					<Text size="xl" weight="bold">{t('default:scheduling.copy.replaceService')}</Text>
					{overwriteRules.map((rule, index) => (
						<RulesListViewEventCard key={rule._id || index} rule={rule as EventReplacementRule} />
					))}
				</Section>
			)}

		</Section>
	);
}
