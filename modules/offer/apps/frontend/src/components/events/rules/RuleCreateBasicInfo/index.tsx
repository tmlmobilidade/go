'use client';

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { IconClockPlay } from '@tabler/icons-react';
import { type HHMM } from '@tmlmobilidade/go-types-offer';
import { Checkbox, Divider, Grid, Section, SegmentedControl, StandardFormController, Switch, Text, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { RuleCreateDates } from '../RuleCreateDates';
import { RuleCreateLines } from '../RuleCreateLines';
import { RuleCreateWeekdays } from '../RuleCreateWeekdays';
import { RuleCreateYearPeriods } from '../RuleCreateYearPeriods';

/* * */

export function RuleCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const createRuleContext = useRuleCreateContext();

	const isRestrictionRule = createRuleContext.values.kind === 'event_restriction';
	const isReplacementRule = createRuleContext.values.kind === 'event_replacement';
	const replacementValues = createRuleContext.values.kind === 'event_replacement' ? createRuleContext.values : null;

	//
	// B. Handle actions

	const formatTimeInput = (value: string): HHMM => {
		const digits = value.replace(/\D/g, '').slice(0, 4);

		if (digits.length <= 2) return digits as HHMM;
		return `${digits.slice(0, 2)}:${digits.slice(2)}` as HHMM;
	};

	const handleToggleAllDay = (e: React.ChangeEvent<HTMLInputElement>) => {
		const enabled = e.currentTarget.checked;

		createRuleContext.form.setValue('all_day', enabled);
		createRuleContext.form.setValue('start_time', (enabled ? '04:00' : '') as HHMM);
		createRuleContext.form.setValue('end_time', (enabled ? '29:59' : '') as HHMM);
	};

	//
	// C. Render components

	return (
		<Section gap="md">

			{/* Rule Type */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">{t('default:events.ruleEditor.ruleType')}</Text>
				<Section gap="sm">
					<SegmentedControl
						value={createRuleContext.values.kind}
						data={[
							{ label: t('default:events.ruleEditor.restriction'), value: 'event_restriction' },
							{ label: t('default:events.ruleEditor.replacement'), value: 'event_replacement' },
						]}
						onChange={(value) => {
							if (value === 'event_replacement') {
								createRuleContext.form.setValue('weekdays', []);
								createRuleContext.form.setValue('year_period_ids', []);
							} else {
								createRuleContext.form.setValue('all_day', false);
								createRuleContext.form.setValue('start_time', '' as HHMM);
								createRuleContext.form.setValue('end_time', '' as HHMM);
							}
							createRuleContext.form.setValue('kind', value as 'event_replacement' | 'event_restriction');
						}}
					/>
					{/* <Spacer orientation="vertical" size="md" /> */}
					<Text c="dimmed">{isReplacementRule ? t('default:events.ruleEditor.replacementDescription') : t('default:events.ruleEditor.restrictionDescription')}</Text>
					<Text c="dimmed" size="sm">{isReplacementRule ? t('default:events.ruleEditor.replacementExample') : t('default:events.ruleEditor.restrictionExample')}</Text>
				</Section>
			</div>

			<Divider />

			{/* Days */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">{t('default:events.ruleEditor.affectedDates')}</Text>
				<RuleCreateDates />
			</div>

			<Divider />

			{/* Lines */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">{t('default:events.ruleEditor.affectedLines')}</Text>
				<RuleCreateLines />
			</div>

			<Divider />

			{/* Replacement rule conditions */}
			{isReplacementRule && (
				<div className={styles.sectionWrapper}>
					<Text size="lg">{t('default:events.ruleEditor.serviceType')}</Text>
					<Text c="dimmed" size="sm">{t('default:events.ruleEditor.operateAs')}</Text>

					<Section>
						<Switch
							checked={Boolean(replacementValues?.same_weekday)}
							description={t('default:events.ruleEditor.sameWeekdayDescription')}
							label={t('default:events.ruleEditor.sameWeekday')}
							onChange={(e) => {
								const enabled = e.currentTarget.checked;
								createRuleContext.form.setValue('same_weekday', enabled);
								if (enabled) {
									createRuleContext.form.setValue('weekdays', []);
								}
							}}
						/>
					</Section>

					{!replacementValues?.same_weekday && (
						<RuleCreateWeekdays />
					)}
					<RuleCreateYearPeriods />

				</div>
			)}

			{/* Restriction rule conditions */}
			{isRestrictionRule && (
				<div className={styles.sectionWrapper}>
					<Text size="lg">{t('default:events.ruleEditor.eventTime')}</Text>
					<Text c="dimmed" size="sm">{t('default:events.ruleEditor.restrictionTimeDescription')}</Text>

					<Checkbox
						checked={isRestrictionRule && createRuleContext.values.kind === 'event_restriction' && createRuleContext.values.all_day}
						label={t('default:events.ruleEditor.allDay')}
						onChange={handleToggleAllDay}
					/>

					{createRuleContext.values.kind === 'event_restriction' && !createRuleContext.values.all_day && (
						<Grid columns="ab" gap="sm">
							<StandardFormController
								control={createRuleContext.form.control}
								name="start_time"
								render={({ field, fieldState }) => (
									<TextInput
										description={t('default:events.ruleEditor.startTimeDescription')}
										error={fieldState.error?.message}
										label={t('default:events.ruleEditor.startTime')}
										leftSection={<IconClockPlay size={18} />}
										onChange={event => field.onChange(formatTimeInput(event.currentTarget.value))}
										value={field.value ?? ''}
									/>
								)}
							/>
							<StandardFormController
								control={createRuleContext.form.control}
								name="end_time"
								render={({ field, fieldState }) => (
									<TextInput
										description={t('default:events.ruleEditor.endTimeDescription')}
										error={fieldState.error?.message}
										label={t('default:events.ruleEditor.endTime')}
										leftSection={<IconClockPlay size={18} />}
										onChange={event => field.onChange(formatTimeInput(event.currentTarget.value))}
										value={field.value ?? ''}
									/>
								)}
							/>
						</Grid>
					)}
				</div>
			)}

		</Section>
	);

	//
}
