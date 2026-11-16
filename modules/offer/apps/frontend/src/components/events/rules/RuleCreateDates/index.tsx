'use client';

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { formatDateWithWeekday } from '@tmlmobilidade/go-utils-offer';
import { MultiSelect, Section, useLocaleContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RuleCreateDates() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: { locale } } = useLocaleContext();
	const createRuleContext = useRuleCreateContext();
	const eventDates = createRuleContext.eventData.dates;

	const dateOptions = useMemo(() => [...eventDates].sort().map(date => ({
		label: formatDateWithWeekday(date, locale),
		value: String(date),
	})), [eventDates, locale]);

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
