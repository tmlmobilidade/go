'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { getCompactMonthOptions } from '@tmlmobilidade/go-utils-dates';
import { Section, SegmentedMultiSelect, Text, useLocaleContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RuleCreateMonths() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const createRuleContext = useRuleCreateContext();
	const { data: { locale } } = useLocaleContext();

	//
	// B. Render components

	return (
		<Section gap="md">

			<Section gap="xs" padding="none">
				<Text>{t(createRuleContext.flags.isEventExceptionEnabled ? 'default:scheduling.months.eventTitle' : 'default:scheduling.months.title')}</Text>
				<Text c="dimmed" size="sm">
					{t(createRuleContext.flags.isEventExceptionEnabled ? 'default:patterns.create.RuleCreateMonths.event_optional_hint' : 'default:patterns.create.RuleCreateMonths.optional_hint')}
				</Text>
			</Section>

			<SegmentedMultiSelect
				value={createRuleContext.data.values.months || []}
				onChange={(selectedDays) => {
					createRuleContext.form.setValue('months', selectedDays.length > 0 ? selectedDays : undefined, { shouldDirty: true, shouldValidate: true });
				}}
				options={getCompactMonthOptions(locale).map(o => ({
					ariaLabel: o.label,
					label: o.label,
					value: o.value,
				}))}
			/>

		</Section>
	);
}
