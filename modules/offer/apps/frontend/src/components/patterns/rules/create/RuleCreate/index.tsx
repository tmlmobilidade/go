'use client';

/* * */

import { RuleCreateBasicInfo } from '@/components/patterns/rules/create/RuleCreateBasicInfo';
import { RuleCreateFooter } from '@/components/patterns/rules/create/RuleCreateFooter';
import { RuleCreateHeader } from '@/components/patterns/rules/create/RuleCreateHeader';
import { RulePreviewCalendar } from '@/components/patterns/rules/create/RulePreviewCalendar';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { buildRuleSummary } from '@/utils/rules/ruleSummary';
import { IconArrowBarToLeft, IconArrowBarToRight, IconLayoutSidebarLeftCollapse, IconX } from '@tabler/icons-react';
import { Button, Calendar, CloseButton, Divider, Grid, IconButton, Section, Surface, Tag, Text } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from './styles.module.css';

import { useRuleCreateContext } from '../RuleCreate.context';

/* * */

export function RuleCreate() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();

	const [drawerOpened, setDrawerOpened] = useState(false);

	return (
		<div className={styles.container}>
			{/* Sidebar Toggle */}
			<div className={styles.sidebar} onClick={() => setDrawerOpened(!drawerOpened)}>
				<div className={styles.sidebarContent}>
					{drawerOpened ? <IconArrowBarToRight /> : <IconArrowBarToLeft />}
				</div>
			</div>

			{/* Main Content */}
			<div className={`${styles.mainContent} ${drawerOpened ? styles.mainContentShift : ''}`}>
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
			{drawerOpened && <div className={styles.backdrop} onClick={() => setDrawerOpened(false)} />}

			{/* Drawer */}
			<div className={`${styles.drawer} ${drawerOpened ? styles.drawerOpen : ''}`}>
				<div className={styles.drawerHeader}>
					<CloseButton onClick={() => setDrawerOpened(false)} type="close" />
					<Tag label="Validação da regra" variant="muted" />
				</div>
				<div className={styles.drawerContent}>
					<Grid columns="ab" gap="md">
						<Surface height="full">
							<Section gap="sm">
								<Text>Resumo:</Text>
								<Divider />
								<Text>{createRuleContext.data.ruleSummary}</Text>
								<Text>Horários: {createRuleContext.data.form.values.timePoints?.join(', ')}</Text>
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
						<RulePreviewCalendar affectedDates={createRuleContext.data.ruleImpact.dates} />
					</Surface>
				</div>
			</div>
		</div>
	);
}
