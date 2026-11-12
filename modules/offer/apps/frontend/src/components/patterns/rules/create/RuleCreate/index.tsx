'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { RuleCreateBasicInfo } from '@/components/patterns/rules/create/RuleCreateBasicInfo';
import { RuleCreateFooter } from '@/components/patterns/rules/create/RuleCreateFooter';
import { RuleCreateHeader } from '@/components/patterns/rules/create/RuleCreateHeader';
import { RulePreviewCalendar } from '@/components/patterns/rules/create/RulePreviewCalendar';
import { RulesDrawerLayout } from '@/components/patterns/rules/shared/RulesDrawerLayout';
import { RuleTimepointCount } from '@/components/patterns/rules/shared/RuleTimepointCount';
import { RuleLabelTag } from '@/components/shared/rules/RuleLabelTag';
import { CalendarAffectedDaysCount, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RuleCreate() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<RulesDrawerLayout
			isOpen={createRuleContext.flags.isDrawerOpen}
			onClose={createRuleContext.actions.closeDrawer}
			onOpen={createRuleContext.actions.openDrawer}
			toggleLabel={t('default:scheduling.copy.affectedDays', '', { count: createRuleContext.data.ruleImpact?.count ?? 0 })}
			drawerContent={(
				<Surface>
					<RulePreviewCalendar affectedDates={createRuleContext.data.ruleImpact?.dates ?? []} onVisibleYearChange={createRuleContext.actions.setPreviewYear} />
				</Surface>
			)}
			drawerHeader={(
				<>
					<div className={styles.drawerRuleTags}>
						<RuleLabelTag label={createRuleContext.data.ruleSummary.label} />
						<RuleTimepointCount count={createRuleContext.data.values.timepoints?.length ?? 0} />
					</div>
					<CalendarAffectedDaysCount className={styles.drawerAffectedDays} count={createRuleContext.data.ruleImpact?.count ?? 0} layout="inline" />
				</>
			)}
		>
			{/* Main Content */}
			<>
				{/* Header */}
				<div className={styles.header}>
					<RuleCreateHeader />
				</div>

				{/* Scrollable Content */}
				<div className={styles.content}>
					<RuleCreateBasicInfo />
				</div>

				{/* Footer */}
				<div className={styles.footer}>
					<RuleCreateFooter />
				</div>
			</>
		</RulesDrawerLayout>
	);
}
