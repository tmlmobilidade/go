'use client';

import { WEEKDAYS } from '@tmlmobilidade/go-types-offer';
import { Section, SelectChipGroup, Text, WeekdaySelector } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRuleCreateContext } from '../RuleCreate.context';

/* * */

const WEEKDAY_PRESETS = {
	all: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
	business: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
	weekend: [WEEKDAYS.Sat, WEEKDAYS.Sun],
} as const;

type WeekdayPresetKey = keyof typeof WEEKDAY_PRESETS;

/* * */

function getSelectedPresetKey(currentWeekdays: number[] | undefined): null | WeekdayPresetKey {
	if (!currentWeekdays?.length) return null;

	const keys = Object.keys(WEEKDAY_PRESETS) as WeekdayPresetKey[];

	for (const key of keys) {
		const preset = WEEKDAY_PRESETS[key];
		const isExactMatch = preset.every(day => currentWeekdays.includes(day)) && currentWeekdays.length === preset.length;

		if (isExactMatch) return key;
	}

	return null;
}

/* * */

export function RuleCreateWeekdays() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const createRuleContext = useRuleCreateContext();

	//
	// B. Handle actions

	const currentWeekdays = createRuleContext.values.kind === 'event_replacement' ? createRuleContext.values.weekdays || [] : [];
	const selectedPresetKey = getSelectedPresetKey(currentWeekdays);

	const applyPreset = (key: null | WeekdayPresetKey) => {
		if (!key) {
			createRuleContext.form.setValue('weekdays', []);
			return;
		}

		createRuleContext.form.setValue('weekdays', [...WEEKDAY_PRESETS[key]]);
	};

	//
	// C. Render components

	return (
		<Section gap="md">

			<Section gap="xs" padding="none">
				<Text>{t('default:events.ruleEditor.dayType')}</Text>
			</Section>

			{/* Quick Select Tags */}
			<SelectChipGroup<WeekdayPresetKey>
				onChange={applyPreset}
				value={selectedPresetKey}
				options={[
					{ label: t('default:events.ruleEditor.all'), value: 'all' },
					{ label: t('default:events.ruleEditor.weekdays'), value: 'business' },
					{ label: t('default:events.ruleEditor.weekend'), value: 'weekend' },
				]}
			/>

			<WeekdaySelector
				value={currentWeekdays}
				onChange={(selectedDays) => {
					createRuleContext.form.setValue('weekdays', selectedDays);
				}}
			/>

		</Section>
	);
}
