'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { RuleCreateBasicInfo } from '@/components/patterns/rules/create/RuleCreateBasicInfo';
import { RuleCreateFooter } from '@/components/patterns/rules/create/RuleCreateFooter';
import { RuleCreateHeader } from '@/components/patterns/rules/create/RuleCreateHeader';
import { RulePreviewCalendar } from '@/components/patterns/rules/create/RulePreviewCalendar';
import { RulePreviewSummary } from '@/components/patterns/rules/create/RulePreviewSummary';
import { IconArrowBarToLeft, IconArrowBarToRight } from '@tabler/icons-react';
import { CalendarAffectedDaysCount, CloseButton, Spacer, Surface, Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function RuleCreate() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			{/* Sidebar Toggle */}
			<div className={styles.sidebar} onClick={() => createRuleContext.flags.isDrawerOpen ? createRuleContext.actions.closeDrawer() : createRuleContext.actions.openDrawer()}>
				<div className={styles.sidebarContent}>
					{createRuleContext.flags.isDrawerOpen ? <IconArrowBarToRight /> : <IconArrowBarToLeft />}
				</div>
			</div>

			{/* Main Content */}
			<div className={styles.mainContent}>
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
			</div>

			{createRuleContext.flags.isDrawerOpen && (
				<>
					{/* Backdrop Overlay */}
					<div className={styles.backdrop} onClick={() => createRuleContext.actions.closeDrawer()} />

					{/* Drawer */}
					<div className={`${styles.drawer} ${styles.drawerOpen}`}>
						<div className={styles.drawerHeader}>
							<CloseButton onClick={() => createRuleContext.actions.closeDrawer()} type="close" />
							<Tag label="Validação da regra" variant="muted" />
							<Spacer />
							<CalendarAffectedDaysCount count={createRuleContext.data.ruleImpact?.count ?? 0} layout="inline" />
						</div>

						<div className={styles.drawerContent}>
							<RulePreviewSummary
								summary={createRuleContext.data.ruleSummary.long}
								timepointCount={createRuleContext.data.form.values.timepoints?.length ?? 0}
							/>

							<Surface>
								<RulePreviewCalendar affectedDates={createRuleContext.data.ruleImpact?.dates ?? []} onVisibleYearChange={createRuleContext.actions.setPreviewYear} />
							</Surface>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
