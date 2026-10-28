'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { RuleCreateEvents } from '@/components/patterns/rules/create/RuleCreateEvents';
import { RuleCreateMonths } from '@/components/patterns/rules/create/RuleCreateMonths';
import { RuleCreatePeriods } from '@/components/patterns/rules/create/RuleCreatePeriods';
import { RuleCreateSchedule } from '@/components/patterns/rules/create/RuleCreateSchedule';
import { RuleCreateWeekdays } from '@/components/patterns/rules/create/RuleCreateWeekdays';
import { hhmm } from '@tmlmobilidade/go-types-offer';
import { Divider, Section, StandardFormController, Switch, Text } from '@tmlmobilidade/ui';

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
					<StandardFormController
						control={createRuleContext.form.control}
						name="operating_mode"
						render={({ field }) => (
							<Switch
								checked={field.value === 'include'}
								description="Define se esta regra ativa ou desativa os horários quando as condições abaixo se verificam."
								label={field.value === 'exclude' ? 'Horários não operam nestes dias' : 'Horários operam nestes dias'}
								onChange={event => field.onChange(event.currentTarget.checked ? 'include' : 'exclude')}
							/>
						)}
					/>

				</Section>
			</div>

			<Divider />

			{/* Schedule */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">2. Que horários esta regra afeta?</Text>
				<Text c="dimmed" size="sm">Também pode colar ou arrastar vários horários de uma folha de cálculo. Ex: 10:00 13:00 15:00 ou 1000 1300 1500</Text>

				<StandardFormController
					control={createRuleContext.form.control}
					name="timepoints"
					render={({ field, fieldState }) => (
						<RuleCreateSchedule
							error={fieldState.error?.message}
							onChange={newTimes => field.onChange(newTimes.map(time => hhmm(time)))}
							value={field.value ?? []}
						/>
					)}
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
