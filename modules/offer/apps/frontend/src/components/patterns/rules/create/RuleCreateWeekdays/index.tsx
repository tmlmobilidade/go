'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { WEEKDAYS } from '@tmlmobilidade/go-types-shared';
import { Section, SelectChipGroup, Text, WeekdaySelector } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { RuleAsteriskField } from '../../shared/RuleAsteriskField';

/* * */

const WEEKDAY_PRESETS = {
	all: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
	business: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
	weekend: [WEEKDAYS.Sat, WEEKDAYS.Sun],
} as const;

type WeekdayPresetKey = keyof typeof WEEKDAY_PRESETS;

/* * */

const getSelectedPresetKey = (currentWeekdays: number[] | undefined): null | WeekdayPresetKey => {
	if (!currentWeekdays?.length) return null;

	const keys = Object.keys(WEEKDAY_PRESETS) as WeekdayPresetKey[];

	for (const key of keys) {
		const preset = WEEKDAY_PRESETS[key];
		const isExactMatch = preset.every(day => currentWeekdays.includes(day)) && currentWeekdays.length === preset.length;

		if (isExactMatch) return key;
	}

	return null;
};

/* * */

export function RuleCreateWeekdays() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const createRuleContext = useRuleCreateContext();

	//
	// B. Handle actions

	const currentWeekdays = createRuleContext.data.values.weekdays || [];
	const selectedPresetKey = getSelectedPresetKey(currentWeekdays);

	const applyPreset = (key: null | WeekdayPresetKey) => {
		if (!key) {
			createRuleContext.form.setValue('weekdays', undefined, { shouldDirty: true, shouldValidate: true });
			return;
		}

		createRuleContext.form.setValue('weekdays', [...WEEKDAY_PRESETS[key]], { shouldDirty: true, shouldValidate: true });
	};

	//
	// C. Render components

	return (
		<Section gap="md">

			<Section gap="xs" padding="none">
				<RuleAsteriskField withAsterisk={!createRuleContext.flags.isEventExceptionEnabled}>
					{t(createRuleContext.flags.isEventExceptionEnabled ? 'default:scheduling.copy.eventWeekdays' : 'default:scheduling.copy.weekdays')}
				</RuleAsteriskField>
				<Text c="dimmed" size="sm">
					{t(createRuleContext.flags.isEventExceptionEnabled ? 'default:patterns.create.RuleCreateWeekdays.optional_hint' : 'default:patterns.create.RuleCreateWeekdays.required_hint')}
				</Text>
			</Section>

			{/* Quick Select Tags */}
			<SelectChipGroup<WeekdayPresetKey>
				onChange={applyPreset}
				value={selectedPresetKey}
				options={[
					{ label: t('default:scheduling.copy.all'), value: 'all' },
					{ label: t('default:scheduling.copy.businessDays'), value: 'business' },
					{ label: t('default:scheduling.copy.weekend'), value: 'weekend' },
				]}
			/>

			<WeekdaySelector
				value={currentWeekdays}
				onChange={(selectedDays) => {
					createRuleContext.form.setValue('weekdays', selectedDays.length > 0 ? selectedDays : undefined, { shouldDirty: true, shouldValidate: true });
				}}
			/>

			{createRuleContext.form.formState.errors.weekdays?.message && (
				<Text c="var(--color-status-danger-primary)">
					{t('default:scheduling.copy.selectWeekday')}
				</Text>
			)}

		</Section>
	);
}
