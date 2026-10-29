'use client';

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { MultiSelect, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RuleCreateDates() {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();

	const createRuleContext = useRuleCreateContext();

	// Get available dates from the event data
	const eventDates = createRuleContext.eventData.dates;

	const dateOptions = [...eventDates].sort().map(date => ({
		label: (() => {
			const jsDate = Dates.fromOperationalDateInt(date, 'Europe/Lisbon').js_date;
			const dateStr = jsDate.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: '2-digit' });
			const weekdayShort = jsDate.toLocaleDateString(i18n.language, { weekday: 'short' }).replace('.', '');
			return `${dateStr} (${weekdayShort})`;
		})(),
		value: String(date),
	}));

	//
	// B. Render components

	return (
		<Section>
			<MultiSelect
				data={dateOptions}
				placeholder={t('default:events.ruleEditor.selectDates')}
				value={[...(createRuleContext.values.dates ?? [])].sort().map(String)}
				w="100%"
				onChange={(selected) => {
					createRuleContext.form.setValue(
						'dates',
						selected.map(date => OperationalDateIntSchema.parse(date)).sort(),
					);
				}}
			/>
		</Section>
	);

	//
}
