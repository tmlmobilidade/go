'use client';

/* * */

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { RuleCreateBasicInfo } from '@/components/patterns/rules/create/RuleCreateBasicInfo';
import { RuleCreateFooter } from '@/components/patterns/rules/create/RuleCreateFooter';
import { RuleCreateHeader } from '@/components/patterns/rules/create/RuleCreateHeader';
import { RulePreviewCalendar } from '@/components/patterns/rules/create/RulePreviewCalendar';
import { IconArrowBarToLeft, IconArrowBarToRight } from '@tabler/icons-react';
import { CloseButton, Divider, Grid, Section, Surface, Tag, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function RuleCreate() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();

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

			{/* Backdrop Overlay */}
			{createRuleContext.flags.isDrawerOpen && <div className={styles.backdrop} onClick={() => createRuleContext.actions.closeDrawer()} />}

			{/* Drawer */}
			<div className={`${styles.drawer} ${createRuleContext.flags.isDrawerOpen ? styles.drawerOpen : ''}`}>
				<div className={styles.drawerHeader}>
					<CloseButton onClick={() => createRuleContext.actions.closeDrawer()} type="close" />
					<Tag label="Validação da regra" variant="muted" />
				</div>

				<div className={styles.drawerContent}>
					<Grid columns="ab" gap="md">
						<Surface height="full">
							<Section gap="sm">
								<Text>Resumo:</Text>
								<Divider />
								<Text>{createRuleContext.data.ruleSummary.long}</Text>
								<Text>Horários: {createRuleContext.data.form.values.timepoints?.join(', ')}</Text>
							</Section>
						</Surface>

						<Surface height="full">
							<Section gap="sm">
								<Text>Impacto:</Text>
								<Divider />
								<Text>{createRuleContext.data.ruleImpact.count} dias afetados no próximo ano</Text>
							</Section>
						</Surface>
					</Grid>

					<Surface>
						<RulePreviewCalendar affectedDates={createRuleContext.data.ruleImpact.dates} onVisibleYearChange={createRuleContext.actions.setPreviewYear} />
					</Surface>
				</div>
			</div>
		</div>
	);
}
