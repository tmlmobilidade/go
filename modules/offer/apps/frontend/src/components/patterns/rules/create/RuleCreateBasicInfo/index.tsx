'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { RuleCreateEvents } from '@/components/patterns/rules/create/RuleCreateEvents';
import { RuleCreateMonths } from '@/components/patterns/rules/create/RuleCreateMonths';
import { RuleCreatePeriods } from '@/components/patterns/rules/create/RuleCreatePeriods';
import { RuleCreateSchedule } from '@/components/patterns/rules/create/RuleCreateSchedule';
import { RuleCreateWeekdays } from '@/components/patterns/rules/create/RuleCreateWeekdays';
import { hhmm } from '@tmlmobilidade/types';
import { Divider, Section, Switch, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function RuleCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();

	//
	// B. Render components

	return (
		<Section gap="md">

			{/* Rule Type */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">1. O que acontece com estes horários?</Text>
				<Section>
					<Switch
						checked={createRuleContext.data.form.values.operating_mode === 'include'}
						description="Define se esta regra ativa ou desativa os horários quando as condições abaixo se verificam."
						label={createRuleContext.data.form.values.operating_mode === 'exclude' ? 'Horários não operam nestes dias' : 'Horários operam nestes dias'}
						onChange={e => createRuleContext.data.form.setFieldValue('operating_mode', e.currentTarget.checked ? 'include' : 'exclude')}
					/>
				</Section>
			</div>

			<Divider />

			{/* Schedule */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">2. Que horários esta regra afeta?</Text>

				<RuleCreateSchedule
					value={createRuleContext.data.form.values.timepoints || []}
					onChange={(newTimes) => {
						createRuleContext.data.form.setFieldValue(
							'timepoints',
							newTimes.length > 0 ? newTimes.map(time => hhmm(time)) : undefined,
						);
					}}
				/>
			</div>

			<Divider />

			{/* Rule Conditions */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">3. Quando devem estes horários aplicar-se?</Text>
				<Text c="dimmed" size="sm">Estes horários aplicam-se quando TODAS as condições abaixo se verificam</Text>

				<RuleCreateEvents />

				<Divider />
				<RuleCreatePeriods />

				<Divider />
				<RuleCreateWeekdays />

				<Divider />
				<RuleCreateMonths />
			</div>

		</Section>
	);

	//
}
