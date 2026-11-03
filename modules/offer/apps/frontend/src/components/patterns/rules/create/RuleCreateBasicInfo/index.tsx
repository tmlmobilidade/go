'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { RuleCreateEvents } from '@/components/patterns/rules/create/RuleCreateEvents';
import { RuleCreateMonths } from '@/components/patterns/rules/create/RuleCreateMonths';
import { RuleCreatePeriods } from '@/components/patterns/rules/create/RuleCreatePeriods';
import { RuleCreateSchedule } from '@/components/patterns/rules/create/RuleCreateSchedule';
import { RuleCreateWeekdays } from '@/components/patterns/rules/create/RuleCreateWeekdays';
import { hhmm } from '@tmlmobilidade/go-types-offer';
import { Divider, Section, StandardFormController, Switch, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RuleCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const createRuleContext = useRuleCreateContext();

	//
	// B. Render components

	return (
		<Section gap="md">

			{/* Rule Type */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">{t('default:scheduling.copy.ruleQuestion')}</Text>
				<Section>
					<StandardFormController
						control={createRuleContext.form.control}
						name="operating_mode"
						render={({ field }) => (
							<Switch
								checked={field.value === 'include'}
								description={t('default:scheduling.copy.operatingHint')}
								label={field.value === 'exclude' ? t('default:scheduling.copy.excludedDays') : t('default:scheduling.copy.includedDays')}
								onChange={event => field.onChange(event.currentTarget.checked ? 'include' : 'exclude')}
							/>
						)}
					/>

				</Section>
			</div>

			<Divider />

			{/* Schedule */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">{t('default:scheduling.copy.timepointsQuestion')}</Text>
				<Text c="dimmed" size="sm">{t('default:scheduling.copy.pasteHint')}</Text>

				<StandardFormController
					control={createRuleContext.form.control}
					name="timepoints"
					render={({ field, fieldState }) => (
						<RuleCreateSchedule
							error={fieldState.error ? t('default:scheduling.copy.checkTimepoints') : undefined}
							onChange={newTimes => field.onChange(newTimes.map(time => hhmm(time)))}
							value={field.value ?? []}
						/>
					)}
				/>

			</div>

			<Divider />

			{/* Rule Conditions */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">{t('default:scheduling.copy.conditionsQuestion')}</Text>
				<Text c="dimmed" size="sm">{t('default:scheduling.copy.conditionsHint')}</Text>

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
