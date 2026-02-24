'use client';

/* * */

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { RuleCreateEvents } from '@/components/patterns/rules/create/RuleCreateEvents';
import { RuleCreateHolidays } from '@/components/patterns/rules/create/RuleCreateHolidays';
import { RuleCreatePeriods } from '@/components/patterns/rules/create/RuleCreatePeriods';
import { RuleCreateSchedule } from '@/components/patterns/rules/create/RuleCreateSchedule';
import { RuleCreateWeekdays } from '@/components/patterns/rules/create/RuleCreateWeekdays';
import { OPERATING_MODE } from '@tmlmobilidade/types';
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
						checked={createRuleContext.data.form.values.operatingMode === OPERATING_MODE.INCLUDE}
						description="Define se esta regra ativa ou desativa os horários quando as condições abaixo se verificam."
						label={createRuleContext.data.form.values.operatingMode === OPERATING_MODE.EXCLUDE ? 'Horários não operam nestes dias' : 'Horários operam nestes dias'}
						onChange={e => createRuleContext.data.form.setFieldValue('operatingMode', e.currentTarget.checked ? OPERATING_MODE.INCLUDE : OPERATING_MODE.EXCLUDE)}
					/>
				</Section>
			</div>

			<Divider />

			{/* Schedule */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">2. Que horários esta regra afeta?</Text>

				<RuleCreateSchedule
					value={createRuleContext.data.form.values.timePoints || []}
					onChange={(newTimes) => {
						createRuleContext.data.form.setFieldValue(
							'timePoints',
							newTimes.length > 0 ? newTimes : undefined,
						);
					}}
				/>
			</div>

			<Divider />

			{/* Rule Conditions */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">3. Quando devem estes horários aplicar-se?</Text>
				<Text c="dimmed" size="sm">Estes horários aplicam-se quando TODAS as condições abaixo se verificam</Text>

				<RuleCreatePeriods />
				<Divider />
				<RuleCreateWeekdays />
				<Divider />
				<RuleCreateHolidays />
				<Divider />
				<RuleCreateEvents />
			</div>

		</Section>
	);

	//
}
